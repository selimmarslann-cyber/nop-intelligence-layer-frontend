// src/routes/admin.ts
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { toJSONBigInt } from "../utils.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

export default async function adminRoutes(fastify: FastifyInstance) {
  // Apply admin auth to all routes in this plugin
  fastify.addHook("onRequest", verifyAdmin);
  // GET /api/admin/withdrawals - Get all withdrawals (optionally filtered by status)
  fastify.get("/api/admin/withdrawals", async (req, reply) => {
    const { status } = req.query as { status?: string };
    
    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      include: {
        user: {
          select: {
            address: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100
    });

    return toJSONBigInt({
      ok: true,
      items: withdrawals.map((w) => ({
        id: w.id,
        address: w.user.address,
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

  // POST /api/admin/withdrawals/:id/approve - Approve a withdrawal
  fastify.post(
    "/api/admin/withdrawals/:id/approve",
    {
      config: {
        rateLimit: {
          max: 50,
          timeWindow: 15 * 60 * 1000, // 15 minutes
        },
      },
    },
    async (req, reply) => {
    const { id } = req.params as { id: string };
    const { validateParams, validateBody, idParamSchema, approveWithdrawalSchema } = await import("../utils/validation.js");
    
    const paramValidation = await validateParams(idParamSchema, { id });
    if (!paramValidation.success) {
      return reply.status(400).send({ ok: false, error: paramValidation.error });
    }

    const bodyValidation = await validateBody(approveWithdrawalSchema, req.body);
    if (!bodyValidation.success) {
      return reply.status(400).send({ ok: false, error: bodyValidation.error });
    }

    const { txHash } = bodyValidation.data;

    const withdrawalId = parseInt(id);
    if (isNaN(withdrawalId)) {
      return reply.status(400).send({ ok: false, error: "Invalid withdrawal ID" });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      return reply.status(404).send({ ok: false, error: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return reply.status(400).send({ ok: false, error: `Withdrawal is ${withdrawal.status}, cannot approve` });
    }

    let finalTxHash = txHash || null;
    let finalStatus = "done";

    // If no txHash provided, send tokens automatically
    if (!txHash) {
      try {
        const { sendTokensToUser } = await import("../services/tokenTransfer.js");
        const { POINTS_PER_TOKEN } = await import("../config.js");
        
        // Send tokens from cold wallet to user
        const sentTxHash = await sendTokensToUser(
          withdrawal.user.address,
          withdrawal.netAmount, // Send net amount (after fees)
          POINTS_PER_TOKEN
        );
        
        finalTxHash = sentTxHash;
        finalStatus = "done";
        
        console.log(`[WITHDRAWAL APPROVED] #${withdrawalId}: Sent ${withdrawal.netAmount.toString()} points to ${withdrawal.user.address}, tx: ${sentTxHash}`);
      } catch (tokenError: any) {
        console.error(`[WITHDRAWAL TOKEN SEND ERROR] #${withdrawalId}:`, tokenError);
        // If token send fails, mark as processing so admin can manually send later
        finalStatus = "processing";
        // Don't throw - allow admin to manually add txHash later
        return reply.status(500).send({ 
          ok: false, 
          error: `Token send failed: ${tokenError.message}. You can manually add txHash and approve again.` 
        });
      }
    } else {
      // If txHash provided, mark as processing (admin will mark as done after confirmation)
      finalStatus = "processing";
    }

    // Update withdrawal status
    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: finalStatus,
        txHash: finalTxHash,
      },
    });

    return toJSONBigInt({
      ok: true,
      withdrawal: {
        id: updated.id,
        status: updated.status,
        txHash: updated.txHash,
      },
    });
    }
  );

  // POST /api/admin/withdrawals/:id/reject - Reject a withdrawal
  fastify.post(
    "/api/admin/withdrawals/:id/reject",
    {
      config: {
        rateLimit: {
          max: 50,
          timeWindow: 15 * 60 * 1000, // 15 minutes
        },
      },
    },
    async (req, reply) => {
    const { id } = req.params as { id: string };
    const { validateParams, idParamSchema } = await import("../utils/validation.js");
    
    const paramValidation = await validateParams(idParamSchema, { id });
    if (!paramValidation.success) {
      return reply.status(400).send({ ok: false, error: paramValidation.error });
    }

    const withdrawalId = parseInt(id);
    if (isNaN(withdrawalId)) {
      return reply.status(400).send({ ok: false, error: "Invalid withdrawal ID" });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      return reply.status(404).send({ ok: false, error: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return reply.status(400).send({ ok: false, error: `Withdrawal is ${withdrawal.status}, cannot reject` });
    }

    // Refund balance to user and mark as failed
    await prisma.$transaction(async (tx: any) => {
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "failed" },
      });

      // Refund the amount back to user balance
      await tx.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: { increment: withdrawal.amount as any },
        },
      });
    });

    return toJSONBigInt({
      ok: true,
      message: "Withdrawal rejected and balance refunded",
    });
    }
  );

  // GET /api/admin/burns - Get all burns
  fastify.get("/api/admin/burns", async (req, reply) => {
    // TODO: When Burn model is added to Prisma schema, fetch from database
    // For now, return mock data
    const mockBurns = [
      {
        id: 1,
        amount: "100000",
        txHash: "0x1234567890abcdef1234567890abcdef12345678",
        note: "Initial burn",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        amount: "50000",
        txHash: null,
        note: "Community event burn",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return {
      ok: true,
      items: mockBurns,
    };
  });

  // POST /api/admin/burns - Add a new burn
  fastify.post(
    "/api/admin/burns",
    {
      config: {
        rateLimit: {
          max: 50,
          timeWindow: 15 * 60 * 1000, // 15 minutes
        },
      },
    },
    async (req, reply) => {
    const { validateBody, addBurnSchema } = await import("../utils/validation.js");
    
    const validation = await validateBody(addBurnSchema, req.body);
    if (!validation.success) {
      return reply.status(400).send({ ok: false, error: validation.error });
    }

    const { amount, txHash, note } = validation.data;

    // TODO: When Burn model is added to Prisma schema, save to database
    // const burn = await prisma.burn.create({
    //   data: {
    //     amount: BigInt(amount),
    //     txHash: txHash || null,
    //     note: note || null,
    //   }
    // });

    // For now, return success with mock data
    return {
      ok: true,
      burn: {
        id: Date.now(),
        amount,
        txHash: txHash || null,
        note: note || null,
        createdAt: new Date().toISOString(),
      },
    };
    }
  );
}

