// Backend route for voting on contributions (1-10 rating)
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export default async function votesRoutes(fastify: FastifyInstance) {

  // POST /api/contribution/:id/vote - Vote on a contribution (1-10)
  fastify.post<{
    Params: { id: string };
    Body: { voterId: string; value: number };
  }>("/api/contribution/:id/vote", async (req, reply) => {
    try {
      const { id } = req.params;
      const { voterId, value } = req.body as { voterId: string; value: number };

      if (!voterId) {
        return reply.status(400).send({ ok: false, error: "voterId required" });
      }

      if (!value || value < 1 || value > 10) {
        return reply.status(400).send({ ok: false, error: "Value must be between 1 and 10" });
      }

      // Get or create voter
      const address = voterId.toLowerCase();
      const voter = await prisma.user.upsert({
        where: { address },
        create: { address, balance: 0n, staked: 0n, rewards: 0n, rewardPerTokenPaid: 0n },
        update: {},
      });

      // Get post
      const post = await prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        return reply.status(404).send({ ok: false, error: "Post not found" });
      }

      // Upsert vote (update if exists, create if not)
      await prisma.vote.upsert({
        where: {
          postId_voterId: {
            postId: id,
            voterId: voter.id,
          },
        },
        create: {
          postId: id,
          voterId: voter.id,
          value,
        },
        update: {
          value,
        },
      });

      // Recalculate average score and vote count
      const votes = await prisma.vote.findMany({
        where: { postId: id },
        select: { value: true },
      });

      const voteCount = votes.length;
      const avgScore = voteCount > 0
        ? votes.reduce((sum, v) => sum + v.value, 0) / voteCount
        : 0;

      // Update post with new stats
      await prisma.post.update({
        where: { id },
        data: {
          avgScore,
          voteCount,
        },
      });

      // Calculate positive/negative votes (>=5 = positive, <5 = negative)
      const positiveVotes = votes.filter(v => v.value >= 5).length;
      const negativeVotes = votes.filter(v => v.value < 5).length;

      return reply.send({
        ok: true,
        item: {
          id: post.id,
          votes: voteCount,
          avg: avgScore,
          positiveVotes,
          negativeVotes,
        },
      });
    } catch (error: any) {
      console.error("Vote error:", error);
      return reply.status(500).send({
        ok: false,
        error: error.message || "Failed to vote",
      });
    }
  });

  // GET /api/contribution/:id/votes - Get vote statistics
  fastify.get<{
    Params: { id: string };
  }>("/api/contribution/:id/votes", async (req, reply) => {
    try {
      const { id } = req.params;

      const post = await prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        return reply.status(404).send({ ok: false, error: "Post not found" });
      }

      // Get votes separately to avoid relation issues
      const votes = await prisma.vote.findMany({
        where: { postId: id },
        select: { value: true },
      });

      const voteCount = votes.length;
      const avgScore = voteCount > 0
        ? votes.reduce((sum, v) => sum + v.value, 0) / voteCount
        : 0;

      const positiveVotes = votes.filter(v => v.value >= 5).length;
      const negativeVotes = votes.filter(v => v.value < 5).length;

      return reply.send({
        ok: true,
        stats: {
          voteCount,
          avgScore,
          positiveVotes,
          negativeVotes,
        },
      });
    } catch (error: any) {
      console.error("Get votes error:", error);
      return reply.status(500).send({
        ok: false,
        error: error.message || "Failed to get votes",
      });
    }
  });
}

