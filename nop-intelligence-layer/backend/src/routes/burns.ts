// src/routes/burns.ts
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export default async function burnsRoutes(fastify: FastifyInstance) {
  // GET /api/burns/total - Get total burned amount (7-digit format)
  fastify.get("/api/burns/total", async (req, reply) => {
    try {
      // Try to calculate from database if Burn model exists
      // For now, use mock data or calculate from admin burns
      // TODO: When Burn model is added to Prisma schema, uncomment:
      // const total = await prisma.burn.aggregate({
      //   _sum: { amount: true }
      // });
      // const totalNum = Number(total._sum.amount || 0n);
      // const totalStr = String(totalNum).padStart(7, "0");
      // return { ok: true, total: totalStr };

      // Mock data for now - ensure 7 digits
      const mockTotal = "160078";
      const totalStr = mockTotal.padStart(7, "0");
      
      return {
        ok: true,
        total: totalStr,
      };
    } catch (error: any) {
      console.error("Burns total error:", error);
      // Return default 7-digit value on error
      return {
        ok: true,
        total: "0000000",
      };
    }
  });
}

