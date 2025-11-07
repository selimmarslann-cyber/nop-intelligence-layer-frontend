// Backend route for explore page - most followed users
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export default async function exploreRoutes(fastify: FastifyInstance) {

  // GET /api/explore/users - Get most followed users (top 20)
  fastify.get<{
    Querystring: { limit?: string };
  }>("/api/explore/users", async (req, reply) => {
    try {
      const limit = parseInt((req.query as any).limit || "20", 10);

      const allUsers = await prisma.user.findMany({ select: { id: true, address: true, balance: true, createdAt: true } });
      const userIds = allUsers.map(u => u.id);
      const addresses = allUsers.map(u => u.address.toLowerCase());
      
      const [allFollows, allPosts] = await Promise.all([
        prisma.follow.findMany({ where: { followingAddress: { in: addresses } }, select: { followingAddress: true } }),
        prisma.post.findMany({ where: { authorId: { in: userIds } }, select: { authorId: true, upvotes: true } }),
      ]);

      const followerCounts = allFollows.reduce((acc, f) => {
        const addr = f.followingAddress.toLowerCase();
        acc[addr] = (acc[addr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const userScores = allPosts.reduce((acc, p) => {
        acc[p.authorId] = (acc[p.authorId] || 0) + (p.upvotes || 0);
        return acc;
      }, {} as Record<number, number>);

      const usersWithCounts = allUsers.map(u => ({
        id: u.id,
        address: u.address,
        score: userScores[u.id] || 0,
        balance: u.balance.toString(),
        followerCount: followerCounts[u.address.toLowerCase()] || 0,
        createdAt: u.createdAt,
      }));

      const topUsers = usersWithCounts.sort((a, b) => b.followerCount - a.followerCount).slice(0, limit);

      return reply.send({
        ok: true,
        users: topUsers,
      });
    } catch (error: any) {
      console.error("Explore users error:", error);
      return reply.status(500).send({
        ok: false,
        error: error.message || "Failed to fetch users",
      });
    }
  });
}

