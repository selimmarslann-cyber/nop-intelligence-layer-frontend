// src/routes/adminExtended.js
// Extended admin routes for dashboard
import { prisma } from "../db.js";
import { toJSONBigInt } from "../utils.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

export default async function adminExtendedRoutes(fastify) {
  // Apply admin auth to all routes
  fastify.addHook("onRequest", verifyAdmin);

  // GET /api/admin/users - Get all users with pagination
  fastify.get("/api/admin/users", async (req, reply) => {
    const { page = "1", limit = "50", search = "", sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (search) {
      where.OR = [
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          address: true,
          balance: true,
          score: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return toJSONBigInt({
      ok: true,
      items: users.map((u) => ({
        id: u.id,
        address: u.address,
        balance: u.balance.toString(),
        score: u.score,
        joinedAt: u.createdAt,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  });

  // POST /api/admin/users/:id/adjust-nop - Adjust user NOP points
  fastify.post("/api/admin/users/:id/adjust-nop", async (req, reply) => {
    const { id } = req.params;
    const { validateBody } = await import("../utils/validation.js");
    const { z } = await import("zod");

    const adjustSchema = z.object({
      amount: z.string().refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num);
      }, "Valid amount required"),
      reason: z.string().optional(),
    });

    const validation = await validateBody(adjustSchema, req.body);
    if (!validation.success) {
      return reply.status(400).send({ ok: false, error: validation.error });
    }

    const { amount, reason } = validation.data;
    const amountBigInt = BigInt(Math.floor(parseFloat(amount)));
    const adminEmail = req.adminEmail;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return reply.status(404).send({ ok: false, error: "User not found" });
    }

    const newBalance = user.balance + amountBigInt;
    if (newBalance < 0n) {
      return reply.status(400).send({ ok: false, error: "Balance cannot be negative" });
    }

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { balance: newBalance },
    });

    // Log admin action
    console.log(`[ADMIN ACTION] ${adminEmail} adjusted NOP for user ${id}: ${amount} (reason: ${reason || "none"})`);

    return toJSONBigInt({
      ok: true,
      newBalance: newBalance.toString(),
    });
  });

  // POST /api/admin/users/:id/ban - Ban/unban user
  fastify.post("/api/admin/users/:id/ban", async (req, reply) => {
    const { id } = req.params;
    const { validateBody } = await import("../utils/validation.js");
    const { z } = await import("zod");

    const banSchema = z.object({
      banned: z.boolean(),
      reason: z.string().optional(),
    });

    const validation = await validateBody(banSchema, req.body);
    if (!validation.success) {
      return reply.status(400).send({ ok: false, error: validation.error });
    }

    const { banned, reason } = validation.data;
    const adminEmail = req.adminEmail;

    // TODO: Add banned field to User model in Prisma schema
    console.log(`[ADMIN ACTION] ${adminEmail} ${banned ? "banned" : "unbanned"} user ${id} (reason: ${reason || "none"})`);

    return {
      ok: true,
      message: `User ${banned ? "banned" : "unbanned"} successfully`,
    };
  });

  // GET /api/admin/contributions - Get all contributions
  fastify.get("/api/admin/contributions", async (req, reply) => {
    const { page = "1", limit = "50", status = "all" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status !== "all") {
      // TODO: Add status field to Contribution model
    }

    const [contributions, total] = await Promise.all([
      prisma.contribution.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              address: true,
            },
          },
        },
      }),
      prisma.contribution.count({ where }),
    ]);

    return toJSONBigInt({
      ok: true,
      items: contributions.map((c) => ({
        id: c.id,
        userId: c.authorId,
        userAddress: c.author.address,
        content: c.content.substring(0, 100) + (c.content.length > 100 ? "..." : ""),
        fullContent: c.content,
        score: c.score,
        createdAt: c.createdAt,
        status: "visible", // TODO: Add status field
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  });

  // POST /api/admin/contributions/:id/delete - Delete contribution
  fastify.post("/api/admin/contributions/:id/delete", async (req, reply) => {
    const { id } = req.params;
    const adminEmail = req.adminEmail;

    await prisma.contribution.delete({ where: { id: parseInt(id) } });

    console.log(`[ADMIN ACTION] ${adminEmail} deleted contribution ${id}`);

    return { ok: true, message: "Contribution deleted" };
  });

  // POST /api/admin/contributions/:id/update-score - Update contribution score
  fastify.post("/api/admin/contributions/:id/update-score", async (req, reply) => {
    const { id } = req.params;
    const { validateBody } = await import("../utils/validation.js");
    const { z } = await import("zod");

    const scoreSchema = z.object({
      score: z.number().int(),
    });

    const validation = await validateBody(scoreSchema, req.body);
    if (!validation.success) {
      return reply.status(400).send({ ok: false, error: validation.error });
    }

    const { score } = validation.data;
    const adminEmail = req.adminEmail;

    await prisma.contribution.update({
      where: { id: parseInt(id) },
      data: { score },
    });

    console.log(`[ADMIN ACTION] ${adminEmail} updated score for contribution ${id} to ${score}`);

    return { ok: true, message: "Score updated" };
  });

  // GET /api/admin/stats - Get dashboard statistics
  fastify.get("/api/admin/stats", async (req, reply) => {
    const [totalUsers, totalContributions, totalBurned, activeEvents] = await Promise.all([
      prisma.user.count(),
      prisma.contribution.count(),
      prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: { status: "done" },
      }),
      prisma.$queryRaw`SELECT COUNT(*) as count FROM "Event" WHERE "endsAt" > NOW() OR "endsAt" IS NULL`.catch(() => [{ count: 0n }]),
    ]);

    const totalNOP = await prisma.user.aggregate({
      _sum: { balance: true },
    });

    return toJSONBigInt({
      ok: true,
      stats: {
        totalUsers,
        totalContributions,
        totalNOP: totalNOP._sum.balance?.toString() || "0",
        totalBurned: totalBurned._sum.amount?.toString() || "0",
        activeEvents: Number(activeEvents[0]?.count || 0),
      },
    });
  });

  // Events CRUD routes
  // GET /api/admin/events - Get all events (admin)
  fastify.get("/api/admin/events", async (req, reply) => {
    // TODO: When Event model is added, fetch from database
    // For now, return mock data
    const mockEvents = [
      {
        id: 1,
        title: "AI Research Week",
        xMultiplier: 2.5,
        startsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
      },
      {
        id: 2,
        title: "Blockchain Deep Dive",
        xMultiplier: 1.8,
        startsAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        active: true,
      },
      {
        id: 3,
        title: "Open Source Contributions",
        xMultiplier: 3.0,
        startsAt: null,
        endsAt: null,
        active: true,
      },
    ];

    return {
      ok: true,
      items: mockEvents,
    };
  });

  // POST /api/admin/events - Create new event
  fastify.post(
    "/api/admin/events",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: 15 * 60 * 1000,
        },
      },
    },
    async (req, reply) => {
      const { validateBody } = await import("../utils/validation.js");
      const { z } = await import("zod");

      const eventSchema = z.object({
        title: z.string().min(1, "Title required"),
        xMultiplier: z.number().positive("Multiplier must be positive"),
        startsAt: z.string().nullable().optional(),
        endsAt: z.string().nullable().optional(),
        active: z.boolean().optional(),
      });

      const validation = await validateBody(eventSchema, req.body);
      if (!validation.success) {
        return reply.status(400).send({ ok: false, error: validation.error });
      }

      const { title, xMultiplier, startsAt, endsAt, active } = validation.data;
      const adminEmail = req.adminEmail;

      // TODO: Save to database when Event model is added
      console.log(`[ADMIN ACTION] ${adminEmail} created event: ${title}`);

      return {
        ok: true,
        event: {
          id: Date.now(),
          title,
          xMultiplier,
          startsAt: startsAt || null,
          endsAt: endsAt || null,
          active: active !== false,
          createdAt: new Date().toISOString(),
        },
      };
    }
  );

  // PUT /api/admin/events/:id - Update event
  fastify.put(
    "/api/admin/events/:id",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: 15 * 60 * 1000,
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const { validateBody } = await import("../utils/validation.js");
      const { z } = await import("zod");

      const eventSchema = z.object({
        title: z.string().min(1).optional(),
        xMultiplier: z.number().positive().optional(),
        startsAt: z.string().nullable().optional(),
        endsAt: z.string().nullable().optional(),
        active: z.boolean().optional(),
      });

      const validation = await validateBody(eventSchema, req.body);
      if (!validation.success) {
        return reply.status(400).send({ ok: false, error: validation.error });
      }

      const adminEmail = req.adminEmail;

      // TODO: Update in database when Event model is added
      console.log(`[ADMIN ACTION] ${adminEmail} updated event ${id}`);

      return {
        ok: true,
        message: "Event updated",
      };
    }
  );

  // DELETE /api/admin/events/:id - Delete event
  fastify.delete(
    "/api/admin/events/:id",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: 15 * 60 * 1000,
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const adminEmail = req.adminEmail;

      // TODO: Delete from database when Event model is added
      console.log(`[ADMIN ACTION] ${adminEmail} deleted event ${id}`);

      return {
        ok: true,
        message: "Event deleted",
      };
    }
  );
}

