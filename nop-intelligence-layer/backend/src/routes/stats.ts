import type { FastifyInstance } from "fastify";

// Cache for top gainers data (5 minute cache)
let gainersCache: { data: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function statsRoutes(app: FastifyInstance) {
  app.get("/api/stats", async () => ({ ok: true, totals: { users: 0, contributions: 0 } }));

  // GET /api/top-gainers - Simple mock data (no external API calls)
  app.get("/api/top-gainers", async (req, reply) => {
    // Check cache first
    const now = Date.now();
    if (gainersCache && now - gainersCache.timestamp < CACHE_DURATION) {
      return reply.send({ ok: true, list: gainersCache.data });
    }

    // Generate mock data with realistic variations
    const mockGainers = [
      { symbol: "BTC", pct: 2.5 + Math.random() * 3, sparkline: [] },
      { symbol: "ETH", pct: 1.8 + Math.random() * 2.5, sparkline: [] },
      { symbol: "BNB", pct: 0.5 + Math.random() * 2, sparkline: [] },
      { symbol: "SOL", pct: 3.2 + Math.random() * 4, sparkline: [] },
      { symbol: "XRP", pct: -0.5 + Math.random() * 1.5, sparkline: [] },
    ].map(g => ({
      symbol: g.symbol,
      pct: Number(g.pct.toFixed(2)),
      sparkline: [],
    }));

    // Update cache
    gainersCache = { data: mockGainers, timestamp: now };
    return reply.send({ ok: true, list: mockGainers });
  });
}
export default statsRoutes;
