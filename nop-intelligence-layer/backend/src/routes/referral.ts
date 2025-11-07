// Backend route for referral system
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { ensureReferralCode, processReferral } from "../utils/referral.js";

export default async function referralRoutes(fastify: FastifyInstance) {
  // GET /api/referral/code/:address - Get user's referral code
  fastify.get("/api/referral/code/:address", async (req, reply) => {
    const { address } = req.params as { address: string };
    const addr = address.toLowerCase();

    try {
      const user = await prisma.user.findUnique({
        where: { address: addr },
        select: { id: true, referralCode: true },
      });

      if (!user) {
        return reply.status(404).send({ ok: false, error: "User not found" });
      }

      // Ensure referral code exists
      const code = await ensureReferralCode(user.id);

      return reply.send({
        ok: true,
        referralCode: code,
      });
    } catch (error: any) {
      console.error("Referral code fetch error:", error);
      return reply.status(500).send({
        ok: false,
        error: error.message || "Failed to fetch referral code",
      });
    }
  });

  // POST /api/referral/register - Register with referral code
  fastify.post(
    "/api/referral/register",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: 15 * 60 * 1000, // 15 minutes
        },
      },
    },
    async (req, reply) => {
      const { validateBody } = await import("../utils/validation.js");
      const { z } = await import("zod");

      const registerSchema = z.object({
        address: z.string().min(1, "Address required"),
        referralCode: z.string().min(1, "Referral code required"),
      });

      const validation = await validateBody(registerSchema, req.body);
      if (!validation.success) {
        return reply.status(400).send({ ok: false, error: validation.error });
      }

      const { address, referralCode } = validation.data;
      const addr = address.toLowerCase();

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { address: addr },
          select: { id: true, referredBy: true },
        });

        if (!existingUser) {
          return reply.status(404).send({ ok: false, error: "User not found. Please connect wallet first." });
        }

        // Check if already referred
        if (existingUser.referredBy) {
          return reply.status(400).send({ ok: false, error: "User already has a referrer" });
        }

        // Process referral
        const result = await processReferral(existingUser.id, referralCode);

        if (!result.success) {
          return reply.status(400).send({ ok: false, error: result.error || "Failed to process referral" });
        }

        return reply.send({
          ok: true,
          message: "Referral processed successfully",
          referrerId: result.referrerId,
        });
      } catch (error: any) {
        console.error("Referral registration error:", error);
        return reply.status(500).send({
          ok: false,
          error: error.message || "Failed to process referral",
        });
      }
    }
  );
}

