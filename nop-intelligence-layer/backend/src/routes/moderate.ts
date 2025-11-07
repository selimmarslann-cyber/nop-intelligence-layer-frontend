import type { FastifyInstance } from "fastify";

export default async function moderateRoutes(fastify: FastifyInstance) {
  fastify.post("/api/moderate", async () => ({ ok: true, reasons: [] }));
}

