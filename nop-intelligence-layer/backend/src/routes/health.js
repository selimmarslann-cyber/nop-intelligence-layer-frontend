export default async function healthRoutes(f) {
    f.get("/health", async () => ({ ok: true, ts: Date.now() }));
}
//# sourceMappingURL=health.js.map