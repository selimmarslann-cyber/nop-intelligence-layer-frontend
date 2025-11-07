// src/routes/burns.js
export default async function burnsRoutes(fastify) {
    // GET /api/burns/total - Get total burned amount
    fastify.get("/api/burns/total", async (req, reply) => {
        // TODO: When Burn model is added to Prisma schema, calculate from database
        // Mock data for now
        return {
            ok: true,
            total: "1234567",
        };
    });
}

