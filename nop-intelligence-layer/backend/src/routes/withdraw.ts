import type { FastifyInstance } from "fastify";
import { verifySignature } from "../middleware/verifySignature.js";

export default async function withdrawRoutes(f: FastifyInstance) {
  f.addHook("preHandler", verifySignature);

  f.post(
    "/withdraw",
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
        amount: z.number().positive("Amount must be positive"),
      });

      const validation = await validateBody(withdrawSchema, req.body);
      if (!validation.success) {
        return reply.code(400).send({ ok: false, error: validation.error });
      }

      const { address, amount } = validation.data;

    const user = await f.prisma.user.upsert({
      where: { address: address.toLowerCase() },
      create: { address: address.toLowerCase(), score: 0, balance: 0n, staked: 0n, rewards: 0n, rewardPerTokenPaid: 0n },
      update: {}
    });

    const wr = await f.prisma.withdrawal.create({
      data: { 
        userId: user.id, 
        amount: BigInt(amount), 
        fee: 0n,
        netAmount: BigInt(amount),
        status: "pending" 
      }
    });

    return { ok: true, requestId: wr.id, status: wr.status };
    }
  );

  f.get("/withdraw/:address", async (req) => {
    const { address } = req.params as { address: string };
    const user = await f.prisma.user.findUnique({ where: { address: address.toLowerCase() } });
    if (!user) return { ok: true, items: [] };
    const items = await f.prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });
    return { ok: true, items };
  });
}
