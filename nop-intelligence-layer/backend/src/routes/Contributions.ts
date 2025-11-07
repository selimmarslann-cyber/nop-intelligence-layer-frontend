import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export async function contributionsRoutes(app: FastifyInstance) {
  app.get("/api/contributions", async () => ({ ok: true, data: [] }));

  // POST /api/contribution (singular - matches frontend)
  app.post(
    "/api/contribution",
    {
      config: {
        rateLimit: {
          max: 50,
          timeWindow: 15 * 60 * 1000, // 15 minutes
        },
      },
    },
    async (req, reply) => {
    const fields: Record<string, string> = {};
    let fileReceived = false;

    // Parse multipart form data
    try {
      for await (const part of req.parts()) {
        if (part.type === "file") {
          fileReceived = true;
          // File handling can be added here if needed
          await part.toBuffer(); // Consume the file stream
          continue;
        }
        if (part.type === "field") {
          fields[part.fieldname] = part.value as string;
        }
      }
    } catch (err: any) {
      if (err.code !== "FST_PARTS_LIMIT" && err.code !== "FST_FILES_LIMIT") {
        return reply.status(400).send({ ok: false, error: "Failed to parse form data" });
      }
    }

    const { authorId, title, body, tags } = fields;

    if (!authorId || !body) {
      return reply.status(400).send({ ok: false, error: "authorId and body are required" });
    }

    // Get or create user
    const address = authorId.toLowerCase();
    const user = await prisma.user.upsert({
      where: { address },
      create: { address, balance: 0n, staked: 0n, rewards: 0n, rewardPerTokenPaid: 0n },
      update: {},
    });

    // Create post
    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        title: title || "",
        body: body.slice(0, 400),
        tags: tags ? JSON.stringify(tags.split(",").map((t: string) => t.trim())) : "[]",
        mediaUrls: "[]",
      },
    });

    // Boost Event: Check if contribution is 100+ characters and award NOP
    const fullText = `${title || ""} ${body}`.trim();
    if (fullText.length >= 100) {
      // Check if user has already completed this task by checking existing posts
      // (excluding the one we just created - we'll check posts before this one)
      const existingPosts = await prisma.post.findMany({
        where: {
          authorId: user.id,
        },
        select: {
          title: true,
          body: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10, // Check last 10 posts
      });

      // Check if any existing post (excluding the one we just created) is 100+ chars
      // The first post in the list should be the one we just created, so skip it
      const hasCompletedBefore = existingPosts.slice(1).some((p) => {
        const text = `${p.title || ""} ${p.body || ""}`.trim();
        return text.length >= 100;
      });

      if (!hasCompletedBefore) {
        // Award 500 NOP for contribution task (first time only)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            balance: {
              increment: 500n,
            },
          },
        });

        console.log(`[BOOST TASK] User ${address} completed contribution task (+500 NOP)`);
      }
    }

    return reply.send({ ok: true, item: post });
    }
  );

  // POST /api/contributions (plural - for compatibility)
  app.post("/api/contributions", async (req, reply) => {
    return reply.send({ ok: true, id: "demo" });
  });
}
export default contributionsRoutes;
