import Fastify from "fastify";
import cors from "@fastify/cors";
import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

declare module "fastify" {
  interface FastifyInstance { prisma: PrismaClient; }
}

const app = Fastify({ logger: false });

// prisma
app.register(fp(async (f) => { f.decorate("prisma", prisma); }));

// JWT for admin auth
await app.register(jwt, {
  secret: process.env.JWT_SECRET || "nop-admin-secret-change-in-production",
});

// Cookies
await app.register(cookie, {
  secret: process.env.COOKIE_SECRET || "nop-cookie-secret-change-in-production",
});

// cors - Only allow frontend origin
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
await app.register(cors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman, etc.) in development
    if (!origin && process.env.NODE_ENV !== "production") {
      return cb(null, true);
    }
    // Check if origin matches frontend
    if (origin === FRONTEND_ORIGIN || origin?.startsWith(FRONTEND_ORIGIN)) {
      return cb(null, true);
    }
    // In development, allow localhost origins
    if (process.env.NODE_ENV !== "production" && origin?.includes("localhost")) {
      return cb(null, true);
    }
    cb(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
});

// rate limiting
import rateLimit from "@fastify/rate-limit";
await app.register(rateLimit, {
  global: false, // Apply per-route
  max: 100,
  timeWindow: 15 * 60 * 1000, // 15 minutes
});

// multipart (upload)
import multipart from "@fastify/multipart";
await app.register(multipart, {
  limits: { fileSize: 4 * 1024 * 1024, files: 1 }, // 4MB, tek dosya
});

// static (uploads servis)
import path from "node:path";
import fastifyStatic from "@fastify/static";
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
await app.register(fastifyStatic, {
  root: UPLOAD_DIR,
  prefix: "/uploads/", // http://localhost:5000/uploads/...
});

app.get("/health", async () => ({ status: "ok" }));

// routes
import { contributionsRoutes } from "./routes/Contributions.ts";
import { feedRoutes } from "./routes/feed.ts";
import { profileRoutes } from "./routes/profile.ts";
import { newsRoutes } from "./routes/news.ts";
import { statsRoutes } from "./routes/stats.ts";
import aiRoutes from "./routes/ai.ts";
import walletRoutes from "./routes/wallet.ts";
import scoreRoutes from "./routes/score.ts";
import withdrawRoutes from "./routes/withdraw.ts";
import adminRoutes from "./routes/admin.ts";
import adminAuthRoutes from "./routes/adminAuth.ts";
import adminExtendedRoutes from "./routes/adminExtended.ts";
import eventsRoutes from "./routes/events.ts";
import burnsRoutes from "./routes/burns.ts";
import moderateRoutes from "./routes/moderate.ts";
import followRoutes from "./routes/follow.ts";
import exploreRoutes from "./routes/explore.ts";
import votesRoutes from "./routes/votes.ts";
import searchRoutes from "./routes/search.ts";
import depositRoutes from "./routes/deposit.ts";
import boostTasksRoutes from "./routes/boostTasks.ts";
import referralRoutes from "./routes/referral.ts";

app.register(contributionsRoutes);
app.register(feedRoutes);
app.register(profileRoutes);
app.register(newsRoutes);
app.register(statsRoutes);
app.register(aiRoutes);
app.register(walletRoutes);
app.register(scoreRoutes);
app.register(withdrawRoutes);
app.register(adminAuthRoutes);
app.register(adminRoutes);
app.register(adminExtendedRoutes);
app.register(eventsRoutes);
app.register(burnsRoutes);
app.register(moderateRoutes);
app.register(followRoutes);
app.register(exploreRoutes);
app.register(votesRoutes);
app.register(searchRoutes);
app.register(depositRoutes);
app.register(boostTasksRoutes);
app.register(referralRoutes);

// Port configuration
const PORT = Number(process.env.PORT ?? 5000);
const host = process.env.HOST || "0.0.0.0";

try {
  await app.listen({ port: PORT, host });
  console.log(`Backend listening on http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
