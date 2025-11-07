// src/routes/admin.js
import { prisma } from "../db.js";
import { toJSONBigInt } from "../utils.js";

export default async function adminRoutes(fastify) {
    // GET /api/admin/withdrawals - Get all withdrawals (optionally filtered by status)
    fastify.get("/api/admin/withdrawals", async (req, reply) => {
        const { status } = req.query;
        const where = {};
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
    fastify.post("/api/admin/withdrawals/:id/approve", async (req, reply) => {
        const { id } = req.params;
        const { txHash } = req.body;
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
        // Update status to "done" (or "processing" if txHash provided)
        const updated = await prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: {
                status: txHash ? "processing" : "done",
                txHash: txHash || null,
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
    });
    // POST /api/admin/withdrawals/:id/reject - Reject a withdrawal
    fastify.post("/api/admin/withdrawals/:id/reject", async (req, reply) => {
        const { id } = req.params;
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
        await prisma.$transaction(async (tx) => {
            await tx.withdrawal.update({
                where: { id: withdrawalId },
                data: { status: "failed" },
            });
            // Refund the amount back to user balance
            await tx.user.update({
                where: { id: withdrawal.userId },
                data: {
                    balance: { increment: withdrawal.amount },
                },
            });
        });
        return toJSONBigInt({
            ok: true,
            message: "Withdrawal rejected and balance refunded",
        });
    });
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
    fastify.post("/api/admin/burns", async (req, reply) => {
        const { amount, txHash, note } = req.body;
        if (!amount || parseFloat(amount) <= 0) {
            return reply.status(400).send({ ok: false, error: "Valid amount required" });
        }
        // TODO: When Burn model is added to Prisma schema, save to database
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
    });
}

