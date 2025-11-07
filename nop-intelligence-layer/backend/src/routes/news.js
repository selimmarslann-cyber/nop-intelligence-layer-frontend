export async function newsRoutes(app) {
    app.get("/api/news", async () => ({ ok: true, items: [] }));
}
export default newsRoutes;
//# sourceMappingURL=news.js.map