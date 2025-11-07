import type { FastifyInstance } from "fastify";
import OpenAI from "openai";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = process.env.GROQ_API_BASE || "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

if (!GROQ_API_KEY) {
  console.warn("⚠️ GROQ_API_KEY is missing - AI features will not work");
}

const openai = GROQ_API_KEY ? new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: GROQ_BASE_URL,
}) : null;

async function aiRoutes(app: FastifyInstance) {
  app.get("/api/ai/health", async (req, reply) => {
    if (!openai) return reply.status(503).send({ ok: false, status: "unhealthy", error: "GROQ_API_KEY not configured" });
    return reply.send({ ok: true, status: "healthy", model: GROQ_MODEL, provider: "Groq" });
  });

  app.post(
    "/api/ai/chat",
    {
      config: {
        rateLimit: {
          max: 90, // 10 saniyede 1 istek = 90 istek / 15 dakika
          timeWindow: 15 * 60 * 1000, // 15 minutes
        },
      },
    },
    async (req, reply) => {
      if (!openai) {
        return reply.status(503).send({ 
          ok: false,
          error: "Groq API is not configured. Please set GROQ_API_KEY in .env file." 
        });
      }
      
      try {
        const { validateBody } = await import("../utils/validation.js");
        const { z } = await import("zod");

        // Parse messages (support both formats)
        let messages: Array<{ role: string; content: string }> = [];
        const body = req.body as any;
        
        if (body?.messages && Array.isArray(body.messages)) {
          const schema = z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() }));
          const val = await validateBody(schema, body.messages);
          if (!val.success) return reply.status(400).send({ error: val.error });
          messages = val.data;
        } else {
          const schema = z.object({ message: z.string().optional(), prompt: z.string().optional() }).refine(d => d.message || d.prompt);
          const val = await validateBody(schema, body);
          if (!val.success) return reply.status(400).send({ error: val.error });
          messages = [
            { role: "system", content: "NOP Copilot, kısa Türkçe asistan." },
            { role: "user", content: val.data.message || val.data.prompt || "" }
          ];
        }

        // Add system prompt if not present
        if (!messages.some((m) => m.role === "system")) {
          messages.unshift({
            role: "system",
            content: `NOP Intelligence Layer AI asistanı. Platform: Twitter benzeri feed, NOP token cüzdanı, Boost Event (3 görev: +500/+5K/+5K NOP), Trend kullanıcılar, Burn Counter, Admin paneli, Top Gainers, Referans sistemi, Stake/Unstake, Deposit/Withdraw (zkSync Era). NOP Token: 0x941Fc398d9FAebdd9f311011541045A1d66c748E. Görevler: 100+ karakter katkı +500, deposit +5K, referans +5K, tümü tamamlanınca +1K bonus. Kısa, samimi, hafif esprili.`,
          });
        }

        const r = await openai.chat.completions.create({
          model: GROQ_MODEL,
          messages: messages as any,
          max_tokens: 512,
          temperature: 0.8,
        });

        return reply.send({ ok: true, reply: r.choices?.[0]?.message?.content?.trim() || "" });
      } catch (err: any) {
        console.error("[AI Error]", err?.message || err);
        const msg = err?.message || String(err);
        const status = err?.status || err?.response?.status;
        
        if (status === 401 || msg.includes("401") || msg.includes("Unauthorized")) {
          return reply.status(502).send({ ok: false, error: "Groq API key geçersiz. GROQ_API_KEY'i kontrol edin." });
        }
        if (status === 429 || msg.includes("429") || msg.includes("rate limit")) {
          return reply.status(429).send({ ok: false, error: "AI servisi yoğun. 1-2 dakika sonra tekrar deneyin.", retryAfter: 120 });
        }
        return reply.status(502).send({ ok: false, error: "AI servisi kullanılamıyor.", detail: msg });
      }
    }
  );
}

export default aiRoutes;
