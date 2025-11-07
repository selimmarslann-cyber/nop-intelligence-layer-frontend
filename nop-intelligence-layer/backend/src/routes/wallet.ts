// src/routes/wallet.ts
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { toJSONBigInt } from "../utils.js";
import {
  MIN_WITHDRAW_POINTS,
  FEE_PERCENT_BPS,
  FEE_FIXED_POINTS,
  DAILY_CAP_POINTS,
  POINTS_PER_TOKEN,
} from "../config.js";

// --- Yardımcı: kullanıcıyı getir / yoksa oluştur (0 bakiyelerle)
async function ensureUser(address: string, referralCode?: string) {
  const addr = address.toLowerCase();
  let u = await prisma.user.findUnique({ where: { address: addr } });
  if (!u) {
    u = await prisma.user.create({
      data: { address: addr, balance: 0n, staked: 0n, rewards: 0n, rewardPerTokenPaid: 0n },
    });

    // Generate referral code for new user
    const { ensureReferralCode } = await import("../utils/referral.js");
    await ensureReferralCode(u.id);

    // Process referral if code provided
    if (referralCode) {
      const { processReferral } = await import("../utils/referral.js");
      await processReferral(u.id, referralCode);
    }
  }
  return u;
}

// --- Özet: balance/staked/rewards
async function getSummary(address: string) {
  const addr = address.toLowerCase();
  const u = await ensureUser(addr);
  return {
    balance: u.balance.toString(),
    staked: u.staked.toString(),
    rewards: u.rewards.toString(),
    tier: "Tier 0",
    cooldownEndsAt: null,
  };
}

// --- Fee hesaplama (puan cinsinden)
function calcFee(amountPoints: bigint) {
  const feePct = (amountPoints * FEE_PERCENT_BPS) / 10000n; // bps -> %
  const fee = feePct + FEE_FIXED_POINTS;
  const net = amountPoints - fee;
  return { fee, net };
}

export default async function walletRoutes(fastify: FastifyInstance) {
  // GET /api/users/:address/summary
  fastify.get("/api/users/:address/summary", async (req, reply) => {
    const { address } = req.params as any;
    if (!address) return reply.status(400).send({ error: "address required" });
    const sum = await getSummary(address);
    return sum;
  });

  // POST /api/stake  { address, amount }
  fastify.post("/api/stake", async (req, reply) => {
    const { address, amount } = req.body as any;
    if (!address || !amount) return reply.status(400).send({ error: "address/amount required" });

    const a = BigInt(amount);
    if (a <= 0n) return reply.status(400).send({ error: "invalid amount" });

    const addr = address.toLowerCase();
    const u = await ensureUser(addr);

    if (u.balance < a) return reply.status(400).send({ error: "insufficient balance" });

    await prisma.user.update({
      where: { address: addr },
      data: {
        balance: { decrement: a as any },
        staked: { increment: a as any },
      },
    });

    return { ok: true };
  });

  // POST /api/unstake  { address, amount }
  fastify.post("/api/unstake", async (req, reply) => {
    const { address, amount } = req.body as any;
    if (!address || !amount) return reply.status(400).send({ error: "address/amount required" });

    const a = BigInt(amount);
    if (a <= 0n) return reply.status(400).send({ error: "invalid amount" });

    const addr = address.toLowerCase();
    const u = await ensureUser(addr);

    if (u.staked < a) return reply.status(400).send({ error: "insufficient staked" });

    await prisma.user.update({
      where: { address: addr },
      data: {
        staked: { decrement: a as any },
        balance: { increment: a as any },
      },
    });

    return { ok: true };
  });

  // GET /api/withdraw/preview?address=0x..&amount=12345  (puan)
  fastify.get("/api/withdraw/preview", async (req, reply) => {
    const { address, amount } = req.query as any;
    if (!address || !amount) return reply.status(400).send({ error: "address/amount required" });

    const a = BigInt(amount);
    if (a <= 0n) return reply.status(400).send({ error: "invalid amount" });

    const u = await ensureUser((address as string).toLowerCase());

    if (u.balance < a) return reply.status(400).send({ error: "insufficient balance" });
    if (a < MIN_WITHDRAW_POINTS) {
      return {
        ok: false,
        min: MIN_WITHDRAW_POINTS.toString(),
        reason: "below minimum",
      };
    }

    const { fee, net } = calcFee(a);
    if (net <= 0n) return reply.status(400).send({ error: "net is zero" });

    // yaklaşık token karşılığı
    const netTokens = Number(net) / Number(POINTS_PER_TOKEN);
    return toJSONBigInt({
      ok: true,
      amount: a,
      fee,
      net,
      min: MIN_WITHDRAW_POINTS,
      netTokens,
    });
  });

  // POST /api/withdraw  { address, amount }   (puan)
  fastify.post(
    "/api/withdraw",
    {
      config: {
        rateLimit: {
          max: 50,
          timeWindow: 15 * 60 * 1000, // 15 minutes
        },
      },
    },
    async (req, reply) => {
      const { validateBody } = await import("../utils/validation.js");
      const { z } = await import("zod");

      const withdrawSchema = z.object({
        address: z.string().min(1, "Address required"),
        amount: z.union([z.string(), z.number()]).transform((val) => {
          const num = typeof val === "string" ? parseFloat(val) : val;
          if (isNaN(num) || num <= 0) throw new Error("Amount must be positive");
          return BigInt(Math.floor(num));
        }),
      });

      const validation = await validateBody(withdrawSchema, req.body);
      if (!validation.success) {
        return reply.status(400).send({ error: validation.error });
      }

      const { address, amount: a } = validation.data;
      const addr = address.toLowerCase();
      const u = await ensureUser(addr);

      // min & balance
      if (a < MIN_WITHDRAW_POINTS) return reply.status(400).send({ error: `min ${MIN_WITHDRAW_POINTS}` });
      if (u.balance < a) return reply.status(400).send({ error: "insufficient balance" });

      // daily cap
      const since = new Date();
      since.setUTCDate(since.getUTCDate() - 1);
      const dailySum = await prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: {
          userId: u.id,
          createdAt: { gte: since },
          status: { in: ["pending", "processing", "done"] },
        },
      });
      const already = BigInt(dailySum._sum.amount ?? 0);
      if (already + a > DAILY_CAP_POINTS) {
        return reply.status(400).send({ error: "daily cap exceeded" });
      }

      // fee/net
      const { fee, net } = calcFee(a);
      if (net <= 0n) return reply.status(400).send({ error: "net is zero" });

      // bakiyeden düş → talep oluştur
      const w = await prisma.$transaction(async (tx: any) => {
        await tx.user.update({
          where: { id: u.id },
          data: { balance: { decrement: a as any } }, // reserve
        });
        const rec = await tx.withdrawal.create({
          data: {
            userId: u.id,
            amount: a,
            fee,
            netAmount: net,
            status: "pending",
          },
        });
        return rec;
      });

      // Not: burada istersen job queue'ya at (BullMQ vs). Şimdilik sadece pending.
      return toJSONBigInt({ ok: true, withdrawalId: w.id });
    }
  );

  // GET /api/users/:address/withdrawals - Get user's withdrawal history
  fastify.get("/api/users/:address/withdrawals", async (req, reply) => {
    const { address } = req.params as any;
    if (!address) return reply.status(400).send({ error: "address required" });

    const addr = address.toLowerCase();
    const u = await prisma.user.findUnique({ where: { address: addr } });
    if (!u) return toJSONBigInt({ ok: true, items: [] });

    const items = await prisma.withdrawal.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return toJSONBigInt({
      ok: true,
      items: items.map((w) => ({
        id: w.id,
        amount: w.amount.toString(),
        fee: w.fee.toString(),
        netAmount: w.netAmount.toString(),
        status: w.status,
        txHash: w.txHash,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })),
    });
  });
}
