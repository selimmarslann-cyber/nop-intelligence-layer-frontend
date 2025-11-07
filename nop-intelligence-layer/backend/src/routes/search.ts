// Backend route for search (users and hashtags)
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export default async function searchRoutes(fastify: FastifyInstance) {
  // GET /api/search - Search for users and hashtags
  fastify.get<{
    Querystring: { q?: string; type?: "users" | "hashtags" | "all" };
  }>("/api/search", async (req, reply) => {
    try {
      const { q = "", type = "all" } = req.query as { q?: string; type?: "users" | "hashtags" | "all" };

      if (!q.trim()) {
        return reply.send({
          ok: true,
          users: [],
          hashtags: [],
        });
      }

      const query = q.trim().toLowerCase();

      const results: {
        users: any[];
        hashtags: string[];
      } = {
        users: [],
        hashtags: [],
      };

      // Search users (by address)
      if (type === "all" || type === "users") {
        const users = await prisma.user.findMany({
          where: {
            address: {
              contains: query,
              mode: "insensitive",
            },
          },
          take: 10,
          select: {
            id: true,
            address: true,
            score: true,
            balance: true,
            createdAt: true,
          },
        });

        // Get follower counts
        const usersWithCounts = await Promise.all(
          users.map(async (user) => {
            const followerCount = await prisma.follow.count({
              where: {
                followingAddress: user.address.toLowerCase(),
              },
            });

            return {
              id: user.id,
              address: user.address,
              score: user.score,
              balance: user.balance.toString(),
              followerCount,
              createdAt: user.createdAt,
            };
          })
        );

        results.users = usersWithCounts;
      }

      // Search hashtags (from posts)
      if (type === "all" || type === "hashtags") {
        const posts = await prisma.post.findMany({
          select: {
            tags: true,
          },
          take: 100,
        });

        const hashtagSet = new Set<string>();
        posts.forEach((post) => {
          try {
            const tags = post.tags ? JSON.parse(post.tags) : [];
            if (Array.isArray(tags)) {
              tags.forEach((tag: string) => {
                const tagLower = tag.toLowerCase();
                if (tagLower.includes(query) && tagLower.startsWith("#")) {
                  hashtagSet.add(tag);
                }
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        });

        results.hashtags = Array.from(hashtagSet).slice(0, 10);
      }

      return reply.send({
        ok: true,
        ...results,
      });
    } catch (error: any) {
      console.error("Search error:", error);
      return reply.status(500).send({
        ok: false,
        error: error.message || "Failed to search",
        users: [],
        hashtags: [],
      });
    }
  });
}

