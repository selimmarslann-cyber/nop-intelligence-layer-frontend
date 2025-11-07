// Backend route for boost tasks status
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { toJSONBigInt } from "../utils.js";

export default async function boostTasksRoutes(fastify: FastifyInstance) {
  // GET /api/boost-tasks/status - Get task completion status for a user
  fastify.get("/api/boost-tasks/status", async (req, reply) => {
    const { address } = req.query as { address?: string };

    if (!address) {
      return reply.status(400).send({ ok: false, error: "address required" });
    }

    try {
      const addr = address.toLowerCase();
      const user = await prisma.user.findUnique({
        where: { address: addr },
      });

      if (!user) {
        return reply.send({
          ok: true,
          tasks: {
            contribution: false,
            refer: false,
            deposit: false,
          },
          allCompleted: false,
        });
      }

      // Check contribution task: User has at least one post with 100+ characters
      const contributionPosts = await prisma.post.findMany({
        where: {
          authorId: user.id,
        },
        select: {
          title: true,
          body: true,
        },
      });

      const contributionCompleted = contributionPosts.some((post) => {
        const fullText = `${post.title || ""} ${post.body || ""}`.trim();
        return fullText.length >= 100;
      });

      // Check deposit task: User has at least one deposit
      // We'll check if user has any balance > 0 from deposits (simplified check)
      // In production, you'd track deposits in a Deposit table
      const depositCompleted = user.balance > 0n; // Simplified: if balance > 0, assume deposit happened

      // Check refer task: User has referred someone (has referredBy set and reward claimed)
      const referCompleted = user.referralRewardClaimed === true;

      return reply.send({
        ok: true,
        tasks: {
          contribution: contributionCompleted,
          refer: referCompleted,
          deposit: depositCompleted,
        },
        allCompleted: contributionCompleted && referCompleted && depositCompleted,
      });
    } catch (error: any) {
      console.error("Boost tasks status error:", error);
      return reply.status(500).send({
        ok: false,
        error: error.message || "Failed to fetch task status",
      });
    }
  });

  // POST /api/boost-tasks/claim - Claim final reward when all tasks completed
  fastify.post(
    "/api/boost-tasks/claim",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: 15 * 60 * 1000, // 15 minutes
        },
      },
    },
    async (req, reply) => {
      const { validateBody } = await import("../utils/validation.js");
      const { z } = await import("zod");

      const claimSchema = z.object({
        address: z.string().min(1, "Address required"),
      });

      const validation = await validateBody(claimSchema, req.body);
      if (!validation.success) {
        return reply.status(400).send({ ok: false, error: validation.error });
      }

      const { address } = validation.data;
      const addr = address.toLowerCase();

      try {
        const user = await prisma.user.findUnique({
          where: { address: addr },
        });

        if (!user) {
          return reply.status(404).send({ ok: false, error: "User not found" });
        }

        // Verify all tasks are completed
        const contributionPosts = await prisma.post.findMany({
          where: { authorId: user.id },
          select: { title: true, body: true },
        });

        const contributionCompleted = contributionPosts.some((post) => {
          const fullText = `${post.title || ""} ${post.body || ""}`.trim();
          return fullText.length >= 100;
        });

        const depositCompleted = user.balance > 0n;
        const referCompleted = user.referralRewardClaimed === true;

        if (!contributionCompleted || !depositCompleted || !referCompleted) {
          return reply.status(400).send({
            ok: false,
            error: "Not all tasks are completed",
          });
        }

        // Calculate total reward (500 + 5000 + 5000 = 10,500 NOP)
        // But individual rewards are already given, so this is a bonus completion reward
        // For now, we'll give a small bonus (e.g., 1,000 NOP) for completing all tasks
        const completionBonus = 1000n;

        // Award completion bonus
        await prisma.user.update({
          where: { id: user.id },
          data: {
            balance: {
              increment: completionBonus,
            },
          },
        });

        console.log(`[BOOST TASK] User ${addr} completed all tasks and claimed bonus (+${completionBonus} NOP)`);

        return reply.send({
          ok: true,
          message: "All tasks completed! Bonus reward claimed.",
          totalReward: completionBonus.toString(),
        });
      } catch (error: any) {
        console.error("Boost tasks claim error:", error);
        return reply.status(500).send({
          ok: false,
          error: error.message || "Failed to claim rewards",
        });
      }
    }
  );
}
