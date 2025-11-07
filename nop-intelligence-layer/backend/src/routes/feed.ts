import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export async function feedRoutes(app: FastifyInstance) {
  // GET /api/feed - Feed endpoint with cursor support
  app.get("/api/feed", async (req, reply) => {
    try {
      const { cursor, take = "10" } = (req.query as any) ?? {};
      const takeNum = Math.min(Number(take) || 10, 50);

      // Try to fetch from database first
      try {
        const posts = await prisma.post.findMany({
          take: takeNum,
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { address: true },
            },
          },
        });

        if (posts.length > 0) {
          // Get votes for all posts in one query
          const postIds = posts.map(p => p.id);
          const allVotes = await prisma.vote.findMany({
            where: { postId: { in: postIds } },
            select: { postId: true, value: true },
          });

          // Group votes by postId
          const votesByPost = allVotes.reduce((acc, vote) => {
            if (!acc[vote.postId]) acc[vote.postId] = [];
            acc[vote.postId].push(vote);
            return acc;
          }, {} as Record<string, Array<{ value: number }>>);

          const items = posts.map((post) => {
            const votes = votesByPost[post.id] || [];
            const voteCount = votes.length;
            const avgScore = voteCount > 0
              ? votes.reduce((sum, v) => sum + v.value, 0) / voteCount
              : 0;
            const positiveVotes = votes.filter((v) => v.value >= 5).length;
            const negativeVotes = votes.filter((v) => v.value < 5).length;

            const tags = post.tags ? JSON.parse(post.tags) : [];
            const mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : [];
            const minutesAgo = Math.floor((Date.now() - post.createdAt.getTime()) / 60000);

            return {
              id: post.id,
              title: post.title || "",
              body: post.body,
              tags: Array.isArray(tags) ? tags : [],
              score: post.upvotes || 0,
              votes: voteCount,
              avg: avgScore,
              voteCount,
              positiveVotes,
              negativeVotes,
              author: `@${post.author.address.slice(0, 8)}`,
              authorSlug: post.author.address.slice(0, 8),
              minutesAgo,
              createdAt: post.createdAt.toISOString(),
              mediaUrls: Array.isArray(mediaUrls) && mediaUrls.length > 0 ? mediaUrls : undefined,
            };
          });

          return reply.send({
            items,
            nextCursor: cursor ? `${Number(cursor) + takeNum}` : `${Date.now()}`,
          });
        }
      } catch (dbErr: any) {
        console.warn("[Feed DB Error, using mock]", dbErr?.message);
      }

      // Fallback mock data
      const items = Array.from({ length: takeNum }, (_, i) => ({
        id: cursor ? `demo-${cursor}-${i}` : `demo-${Date.now()}-${i}`,
        title: `Demo Contribution ${i + 1}`,
        body: `Sample contribution post #${i + 1}`,
        tags: i % 2 === 0 ? ["#AI", "#Blockchain"] : ["#Web3", "#DeFi"],
        score: 70 + i,
        votes: 10 + i * 2,
        avg: 7.0 + i * 0.1,
        voteCount: 10 + i * 2,
        positiveVotes: Math.floor((10 + i * 2) * 0.75),
        negativeVotes: Math.ceil((10 + i * 2) * 0.25),
        author: `@demo${i + 1}`,
        authorSlug: `demo${i + 1}`,
        minutesAgo: i + 1,
        createdAt: new Date(Date.now() - (i + 1) * 60000).toISOString(),
        mediaUrls: i % 3 === 0 ? [] : undefined,
      }));

      return reply.send({
        items,
        nextCursor: cursor ? `${Number(cursor) + takeNum}` : `${Date.now()}`,
      });
    } catch (err: any) {
      console.error("[Feed Route Error]", err);
      return reply.status(500).send({
        ok: false,
        error: err?.message || "Failed to fetch feed",
        items: [],
      });
    }
  });
}
export default feedRoutes;
