import type { FastifyInstance } from "fastify";
import { verifySignature } from "../middleware/verifySignature.js";

export default async function scoreRoutes(f: FastifyInstance) {
  f.addHook("preHandler", verifySignature);

  f.get("/score/:address", async (req, reply) => {
    const { address } = req.params as { address: string };
    const user = await f.prisma.user.upsert({
      where: { address: address.toLowerCase() },
      create: { address: address.toLowerCase(), score: 0, balance: 0n, staked: 0n, rewards: 0n, rewardPerTokenPaid: 0n },
      update: {}
    });
    return { ok: true, address, score: user.score };
  });

  f.post("/score", async (req, reply) => {
    const { address, delta, set } = req.body as { address: string; delta?: number; set?: number };
    if (!address) return reply.code(400).send({ ok: false, error: "address required" });

    const user = await f.prisma.user.upsert({
      where: { address: address.toLowerCase() },
      create: { address: address.toLowerCase(), score: 0, balance: 0n, staked: 0n, rewards: 0n, rewardPerTokenPaid: 0n },
      update: {}
    });

    let newScore = user.score;
    if (typeof set === "number") newScore = set;
    if (typeof delta === "number") newScore = user.score + delta;

    const updated = await f.prisma.user.update({
      where: { address: address.toLowerCase() },
      data: { score: newScore }
    });

    return { ok: true, address, score: updated.score };
  });
}
