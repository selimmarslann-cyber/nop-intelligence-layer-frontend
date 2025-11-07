import type { FastifyInstance } from "fastify";

export async function profileRoutes(app: FastifyInstance) {
  app.get("/api/profile/:userId", async (req) => {
    const { userId } = (req.params as any);
    return { ok: true, userId, profile: { name: "Demo", score: 0 } };
  });
}
export default profileRoutes;
