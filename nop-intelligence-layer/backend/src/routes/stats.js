export async function statsRoutes(app) {
    app.get("/api/stats", async () => ({ ok: true, totals: { users: 0, contributions: 0 } }));
    // GET /api/top-gainers - Get top crypto gainers with sparkline data
    app.get("/api/top-gainers", async (req, reply) => {
        // TODO: When crypto data source is integrated, fetch real data
        // For now, return mock data with sparklines
        const mockGainers = [
            {
                symbol: "BTC",
                pct: 5.23,
                sparkline: [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 111, 110, 112, 115, 113, 116, 118, 117, 119, 120],
            },
            {
                symbol: "ETH",
                pct: 3.45,
                sparkline: [2000, 2010, 2005, 2015, 2020, 2018, 2025, 2030, 2028, 2035, 2040, 2038, 2045, 2050, 2048, 2055, 2060, 2058, 2065, 2070],
            },
            {
                symbol: "SOL",
                pct: 8.12,
                sparkline: [150, 152, 151, 153, 155, 154, 156, 158, 157, 159, 161, 160, 162, 165, 163, 166, 168, 167, 169, 170],
            },
            {
                symbol: "AVAX",
                pct: 2.34,
                sparkline: [40, 41, 40.5, 41.5, 42, 41.8, 42.2, 42.5, 42.3, 42.8, 43, 42.9, 43.2, 43.5, 43.3, 43.8, 44, 43.9, 44.2, 44.5],
            },
            {
                symbol: "MATIC",
                pct: -1.23,
                sparkline: [0.85, 0.86, 0.85, 0.84, 0.83, 0.84, 0.83, 0.82, 0.83, 0.82, 0.81, 0.82, 0.81, 0.80, 0.81, 0.80, 0.79, 0.80, 0.79, 0.78],
            },
        ];
        return {
            ok: true,
            list: mockGainers,
        };
    });
}
export default statsRoutes;
//# sourceMappingURL=stats.js.map