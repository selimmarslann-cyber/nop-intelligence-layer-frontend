// src/routes/adminAuth.ts
// Admin authentication routes
import type { FastifyInstance } from "fastify";
import { ADMIN_EMAILS, ADMIN_PASSWORD, ADMIN_USERNAME } from "../middleware/adminAuth.js";
import bcrypt from "bcryptjs";

export default async function adminAuthRoutes(fastify: FastifyInstance) {
  // POST /api/admin/login - Admin login (supports both username and email)
  fastify.post(
    "/api/admin/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: 15 * 60 * 1000, // 15 minutes - strict rate limit for login
        },
      },
    },
    async (req, reply) => {
      const { validateBody } = await import("../utils/validation.js");
      const { z } = await import("zod");

      const loginSchema = z.object({
        username: z.string().optional(),
        email: z.string().optional(),
        password: z.string().min(1, "Password required"),
      });

      const validation = await validateBody(loginSchema, req.body);
      if (!validation.success) {
        return reply.status(400).send({ ok: false, error: validation.error });
      }

      const { username, email, password } = validation.data;

      // Support both username and email login
      let isAuthorized = false;
      let identifier = "";

      if (username) {
        // Username-based login
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          isAuthorized = true;
          identifier = username;
        }
      } else if (email) {
        // Email-based login (backward compatibility)
        const emailLower = email.toLowerCase().trim();
        if (ADMIN_EMAILS.includes(emailLower) && password === ADMIN_PASSWORD) {
          isAuthorized = true;
          identifier = emailLower;
        }
      }

      if (!isAuthorized) {
        return reply.status(401).send({ ok: false, error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = (fastify as any).jwt.sign(
        username ? { username } : { email: identifier },
        { expiresIn: "24h" }
      );

      // Set cookie
      reply.setCookie("adminToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });

      return {
        ok: true,
        token,
        username: username || undefined,
        email: email || undefined,
      };
    }
  );

  // POST /api/admin/logout - Admin logout
  fastify.post("/api/admin/logout", async (req, reply) => {
    reply.clearCookie("adminToken", { path: "/" });
    return { ok: true, message: "Logged out successfully" };
  });

  // GET /api/admin/me - Get current admin info
  fastify.get("/api/admin/me", async (req, reply) => {
    const token = req.cookies?.adminToken || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return reply.status(401).send({ ok: false, error: "Unauthorized" });
    }

    try {
      const decoded = (fastify as any).jwt.verify(token) as { username?: string; email?: string };
      
      // Support both username and email
      const isAuthorized = 
        (decoded.username && decoded.username === ADMIN_USERNAME) ||
        (decoded.email && ADMIN_EMAILS.includes(decoded.email.toLowerCase()));

      if (!isAuthorized) {
        return reply.status(403).send({ ok: false, error: "Forbidden" });
      }
      
      return { 
        ok: true, 
        username: decoded.username,
        email: decoded.email 
      };
    } catch (error) {
      return reply.status(401).send({ ok: false, error: "Invalid token" });
    }
  });
}

