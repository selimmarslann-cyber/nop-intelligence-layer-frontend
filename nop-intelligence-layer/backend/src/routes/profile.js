export async function profileRoutes(app) {
    app.get("/api/profile/:userId", async (req) => {
        const { userId } = req.params;
        return { ok: true, userId, profile: { name: "Demo", score: 0 } };
    });
}
export default profileRoutes;
//# sourceMappingURL=profile.js.map