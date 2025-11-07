// Backend route for handling deposit notifications
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { toJSONBigInt } from "../utils.js";

export default async function depositRoutes(fastify: FastifyInstance) {
  // POST /api/deposit - Notify backend about a deposit transaction
  fastify.post(
    "/api/deposit",
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

      const depositSchema = z.object({
        address: z.string().min(1, "Address required"),
        amount: z.string().or(z.number()),
        txHash: z.string().min(1, "Transaction hash required"),
      });

      const validation = await validateBody(depositSchema, req.body);
      if (!validation.success) {
        return reply.status(400).send({ ok: false, error: validation.error });
      }

      const { address, amount, txHash } = validation.data;
      const addr = address.toLowerCase();

      try {
        // Get or create user
        const user = await prisma.user.upsert({
          where: { address: addr },
          create: {
            address: addr,
            balance: 0n,
            staked: 0n,
            rewards: 0n,
            rewardPerTokenPaid: 0n,
          },
          update: {},
        });

        // Convert amount to BigInt (assuming amount is in tokens, not wei)
        const amountBigInt = BigInt(Math.floor(parseFloat(String(amount))));

        // Verify transaction exists on blockchain (optional - can be added later)
        // For now, trust the frontend notification

        // Get user before deposit to check if it's first deposit
        const userBeforeDeposit = await prisma.user.findUnique({
          where: { address: addr },
          select: { balance: true, id: true },
        });

        const balanceBefore = userBeforeDeposit?.balance || 0n;
        const isFirstDeposit = balanceBefore === 0n && amountBigInt > 0n;

        // Add to user balance
        const updatedUser = await prisma.user.update({
          where: { address: addr },
          data: {
            balance: {
              increment: amountBigInt,
            },
          },
        });

        // Boost Event: Award 5,000 NOP for deposit task (first deposit only)
        if (isFirstDeposit && userBeforeDeposit) {
          // Award 5,000 NOP for deposit task (first time only)
          await prisma.user.update({
            where: { id: userBeforeDeposit.id },
            data: {
              balance: {
                increment: 5000n,
              },
            },
          });

          console.log(`[BOOST TASK] User ${addr} completed deposit task (+5,000 NOP)`);
        }

        // Log deposit
        console.log(`[DEPOSIT] ${addr} deposited ${amount} NOP (tx: ${txHash})`);

        // Get final balance after boost reward
        const finalUser = await prisma.user.findUnique({
          where: { address: addr },
        });

        return reply.send({
          ok: true,
          message: "Deposit recorded",
          newBalance: finalUser?.balance.toString() || updatedUser.balance.toString(),
        });
      } catch (error: any) {
        console.error("Deposit error:", error);
        return reply.status(500).send({
          ok: false,
          error: error.message || "Failed to record deposit",
        });
      }
    }
  );
}

