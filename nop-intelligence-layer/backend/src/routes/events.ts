// src/routes/events.ts
import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export default async function eventsRoutes(fastify: FastifyInstance) {
  // GET /api/events/boosted - Get all active boosted events
  fastify.get("/api/events/boosted", async (req, reply) => {
    // TODO: When BoostedEvent model is added to Prisma schema, fetch from database
    // For now, return mock data or empty array
    
    // Example structure for when database is ready:
    // const events = await prisma.boostedEvent.findMany({
    //   where: {
    //     active: true,
    //     OR: [
    //       { endsAt: null },
    //       { endsAt: { gt: new Date() } }
    //     ]
    //   },
    //   orderBy: { createdAt: "desc" }
    // });

    // Mock data for now
    const mockEvents = [
      {
        id: 1,
        title: "AI Research Week",
        xMultiplier: 2.5,
        endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      },
      {
        id: 2,
        title: "Blockchain Deep Dive",
        xMultiplier: 1.8,
        endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
      },
      {
        id: 3,
        title: "Open Source Contributions",
        xMultiplier: 3.0,
        endsAt: null,
      },
    ];

    return {
      ok: true,
      items: mockEvents,
    };
  });
}

