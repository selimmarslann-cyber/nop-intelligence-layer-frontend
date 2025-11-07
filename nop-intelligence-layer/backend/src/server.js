import Fastify from "fastify";
import cors from "@fastify/cors";
import fp from "fastify-plugin";
import * as dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = Fastify({ logger: false });
// prisma
app.register(fp(async (f) => { f.decorate("prisma", prisma); }));
// cors
await app.register(cors, { origin: process.env.ALLOWED_ORIGIN || true });
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
    prefix: "/uploads/", // http://localhost:3001/uploads/...
});
app.get("/health", async () => ({ status: "ok" }));
// routes
import { contributionsRoutes } from "./routes/Contributions.js";
import { feedRoutes } from "./routes/feed.js";
import { profileRoutes } from "./routes/profile.js";
import { newsRoutes } from "./routes/news.js";
import { statsRoutes } from "./routes/stats.js";
import aiRoutes from "./routes/ai.js";
import walletRoutes from "./routes/wallet.js";
import scoreRoutes from "./routes/score.js";
import withdrawRoutes from "./routes/withdraw.js";
app.register(contributionsRoutes);
app.register(feedRoutes);
app.register(profileRoutes);
app.register(newsRoutes);
app.register(statsRoutes);
app.register(aiRoutes);
app.register(walletRoutes);
app.register(scoreRoutes);
app.register(withdrawRoutes);
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";
try {
    await app.listen({ port, host });
    console.log("Backend listening on", `http://${host}:${port}`);
}
catch (err) {
    app.log.error(err);
    process.exit(1);
}
//# sourceMappingURL=server.js.map