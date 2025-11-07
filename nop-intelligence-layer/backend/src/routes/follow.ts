// Backend route for follow/unfollow functionality with NOP payment
import type { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const FOLLOW_COST = 50000n; // 50,000 NOP

export default async function followRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma;

  // POST /api/follow/:targetAddress - Follow a user (costs 50,000 NOP)
  fastify.post<{
    Params: { targetAddress: string };
    Body: { followerAddress: string };
  }>("/api/follow/:targetAddress", async (req, reply) => {
    const { targetAddress } = req.params;
    const { followerAddress } = req.body as { followerAddress: string };

    if (!followerAddress || !targetAddress) {
      return reply.status(400).send({ ok: false, error: "Addresses required" });
    }

    if (followerAddress.toLowerCase() === targetAddress.toLowerCase()) {
      return reply.status(400).send({ ok: false, error: "Cannot follow yourself" });
    }

    try {
      // Get or create follower
      let follower = await prisma.user.findUnique({
        where: { address: followerAddress.toLowerCase() },
      });

      if (!follower) {
        follower = await prisma.user.create({
          data: { address: followerAddress.toLowerCase(), balance: 0n },
        });
      }

      // Get or create target user (for reference)
      let target = await prisma.user.findUnique({
        where: { address: targetAddress.toLowerCase() },
      });

      if (!target) {
        target = await prisma.user.create({
          data: { address: targetAddress.toLowerCase(), balance: 0n },
        });
      }

      // Check if already following
      const existingFollow = await prisma.follow.findFirst({
        where: {
          followerId: follower.id,
          followingAddress: targetAddress.toLowerCase(),
        },
      });

      if (existingFollow) {
        return reply.status(400).send({ ok: false, error: "Already following" });
      }

      // Check balance
      if (follower.balance < FOLLOW_COST) {
        return reply.status(400).send({
          ok: false,
          error: "Insufficient balance",
          required: FOLLOW_COST.toString(),
          current: follower.balance.toString(),
        });
      }

      // Deduct NOP and create follow relationship
      const newBalance = follower.balance - FOLLOW_COST;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: follower.id },
          data: { balance: newBalance },
        }),
        prisma.follow.create({
          data: {
            followerId: follower.id,
            followingAddress: targetAddress.toLowerCase(),
          },
        }),
      ]);

      return reply.send({
        ok: true,
        newBalance: newBalance.toString(),
        message: "Followed successfully",
      });
    } catch (error: any) {
      console.error("Follow error:", error);
      return reply.status(500).send({ ok: false, error: error.message || "Follow failed" });
    }
  });

  // POST /api/unfollow/:targetAddress - Unfollow a user (no refund)
  fastify.post<{
    Params: { targetAddress: string };
    Body: { followerAddress: string };
  }>("/api/unfollow/:targetAddress", async (req, reply) => {
    const { targetAddress } = req.params;
    const { followerAddress } = req.body as { followerAddress: string };

    if (!followerAddress || !targetAddress) {
      return reply.status(400).send({ ok: false, error: "Addresses required" });
    }

    try {
      const follower = await prisma.user.findUnique({
        where: { address: followerAddress.toLowerCase() },
      });

      if (!follower) {
        return reply.status(404).send({ ok: false, error: "Follower not found" });
      }

      const follow = await prisma.follow.findFirst({
        where: {
          followerId: follower.id,
          followingAddress: targetAddress.toLowerCase(),
        },
      });

      if (!follow) {
        return reply.status(400).send({ ok: false, error: "Not following" });
      }

      await prisma.follow.delete({ where: { id: follow.id } });

      return reply.send({ ok: true, message: "Unfollowed successfully" });
    } catch (error: any) {
      console.error("Unfollow error:", error);
      return reply.status(500).send({ ok: false, error: error.message || "Unfollow failed" });
    }
  });

  // GET /api/follow/status/:targetAddress - Check if following
  fastify.get<{
    Params: { targetAddress: string };
    Querystring: { followerAddress: string };
  }>("/api/follow/status/:targetAddress", async (req, reply) => {
    const { targetAddress } = req.params;
    const { followerAddress } = req.query as { followerAddress: string };

    if (!followerAddress) {
      return reply.status(400).send({ ok: false, error: "followerAddress required" });
    }

    try {
      const follower = await prisma.user.findUnique({
        where: { address: followerAddress.toLowerCase() },
      });

      if (!follower) {
        return reply.send({ ok: true, following: false });
      }

      const follow = await prisma.follow.findFirst({
        where: {
          followerId: follower.id,
          followingAddress: targetAddress.toLowerCase(),
        },
      });

      return reply.send({ ok: true, following: !!follow });
    } catch (error: any) {
      console.error("Follow status error:", error);
      return reply.status(500).send({ ok: false, error: error.message || "Status check failed" });
    }
  });
}

