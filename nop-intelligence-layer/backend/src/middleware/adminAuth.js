// src/middleware/adminAuth.js
// Admin authentication middleware
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // Default password, should be changed
export async function verifyAdmin(request, reply) {
    try {
        const token = request.cookies?.adminToken || request.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return reply.status(401).send({ ok: false, error: "Unauthorized" });
        }
        // Verify JWT token
        const decoded = request.server.jwt.verify(token);
        if (!ADMIN_EMAILS.includes(decoded.email.toLowerCase())) {
            return reply.status(403).send({ ok: false, error: "Forbidden" });
        }
        // Attach admin info to request
        request.adminEmail = decoded.email;
    }
    catch (error) {
        return reply.status(401).send({ ok: false, error: "Invalid token" });
    }
}
export { ADMIN_EMAILS, ADMIN_PASSWORD };

