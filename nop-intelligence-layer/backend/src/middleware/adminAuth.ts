// src/middleware/adminAuth.ts
// Admin authentication middleware
import type { FastifyRequest, FastifyReply } from "fastify";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "selimarslan";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sello159++";

// For backward compatibility, also support email-based login
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function verifyAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = request.cookies?.adminToken || request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return reply.status(401).send({ ok: false, error: "Unauthorized" });
    }

    // Verify JWT token
    const decoded = (request.server as any).jwt.verify(token) as { username?: string; email?: string; iat: number; exp: number };

    // Support both username and email-based auth
    const isAuthorized = 
      (decoded.username && decoded.username === ADMIN_USERNAME) ||
      (decoded.email && ADMIN_EMAILS.includes(decoded.email.toLowerCase()));

    if (!isAuthorized) {
      return reply.status(403).send({ ok: false, error: "Forbidden" });
    }

    // Attach admin info to request
    (request as any).adminEmail = decoded.email || decoded.username;
    (request as any).adminUsername = decoded.username || decoded.email;
  } catch (error) {
    return reply.status(401).send({ ok: false, error: "Invalid token" });
  }
}

export { ADMIN_EMAILS, ADMIN_PASSWORD, ADMIN_USERNAME };

