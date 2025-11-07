import { verifySignature } from "../middleware/verifySignature.js";
export default async function withdrawRoutes(f) {
    f.addHook("preHandler", verifySignature);
    f.post("/withdraw", async (req, reply) => {
        const { address, amount } = req.body;
        if (!address || !amount || amount <= 0) {
            return reply.code(400).send({ ok: false, error: "address and amount > 0 required" });
        }
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
    });
    f.get("/withdraw/:address", async (req) => {
        const { address } = req.params;
        const user = await f.prisma.user.findUnique({ where: { address: address.toLowerCase() } });
        if (!user)
            return { ok: true, items: [] };
        const items = await f.prisma.withdrawal.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        });
        return { ok: true, items };
    });
}
//# sourceMappingURL=withdraw.js.map