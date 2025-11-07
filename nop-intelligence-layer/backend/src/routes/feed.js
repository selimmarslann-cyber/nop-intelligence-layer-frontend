export async function feedRoutes(app) {
    // örnek: boş feed
    app.get("/api/feed", async () => ({ items: [] }));
}
export default feedRoutes;
//# sourceMappingURL=feed.js.map