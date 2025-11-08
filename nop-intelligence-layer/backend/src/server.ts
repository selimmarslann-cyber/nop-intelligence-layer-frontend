import 'dotenv/config';
import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';

const required = (name: string) => {
  const v = process.env[name];
  if (v === undefined || v === null || v === '') {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
};

export const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: required('DB_USER'),
  database: required('DB_NAME'),
  password: String(required('DB_PASSWORD')),
  port: Number(process.env.DB_PORT || 5432),
  ssl: false
});

const app: FastifyInstance = Fastify({ logger: true });

app.get('/health', async () => ({ ok: true }));

app.get('/db-ping', async (_, reply) => {
  try {
    const r = await pool.query('SELECT 1 AS ok');
    return { db: r.rows[0]?.ok === 1 };
  } catch (err) {
    app.log.error(err);
    return reply.code(500).send({ db: false });
  }
});

const port = Number(process.env.PORT || 5000);
const host = process.env.HOST || '0.0.0.0';

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type Gainer = { symbol: string; pct: number; sparkline?: number[] };

let cachedGainers: { list: Gainer[]; fetchedAt: number } | null = null;
let cachedNews: { items: { title: string; link: string; source: string }[]; fetchedAt: number } | null = null;

const FIVE_MIN = 5 * 60 * 1000;

async function loadTopGainers(): Promise<Gainer[]> {
  if (cachedGainers && Date.now() - cachedGainers.fetchedAt < FIVE_MIN) {
    return cachedGainers.list;
  }

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h',
    );
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const data = (await res.json()) as any[];
    const list = data
      .map((coin) => ({
        symbol: coin.symbol?.toUpperCase() ?? coin.id,
        pct: Number(coin.price_change_percentage_24h) || 0,
        sparkline: Array.isArray(coin.sparkline_in_7d?.price)
          ? coin.sparkline_in_7d.price.slice(-20)
          : undefined,
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);

    cachedGainers = { list, fetchedAt: Date.now() };
    return list;
  } catch (err) {
    app.log.error({ err }, 'Failed to fetch top gainers, sending fallback');
    const fallback: Gainer[] = [
      { symbol: 'BTC', pct: 2.31, sparkline: [42000, 42120, 42210, 42350, 42420] },
      { symbol: 'ETH', pct: 1.85, sparkline: [2200, 2215, 2220, 2230, 2240] },
      { symbol: 'SOL', pct: 4.52, sparkline: [95, 97, 99, 100, 101] },
      { symbol: 'AVAX', pct: 3.24, sparkline: [36, 36.5, 37.1, 37.4, 37.9] },
    ];
    cachedGainers = { list: fallback, fetchedAt: Date.now() };
    return fallback;
  }
}

app.get('/api/top-gainers', async (_, reply) => {
  const list = await loadTopGainers();
  return reply.send({ ok: true, list });
});

type NewsItem = { title: string; link: string; source: string; isoDate?: string };

async function loadNews(limit = 12): Promise<NewsItem[]> {
  if (cachedNews && Date.now() - cachedNews.fetchedAt < FIVE_MIN) {
    return cachedNews.items.slice(0, limit);
  }

  try {
    const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
    if (!res.ok) throw new Error(`cryptocompare ${res.status}`);
    const data = (await res.json()) as any;
    const items: NewsItem[] = Array.isArray(data?.Data)
      ? data.Data.slice(0, 25).map((item: any) => ({
        title: item.title,
        link: item.url,
        source: item.source,
        isoDate: item.published_on ? new Date(item.published_on * 1000).toISOString() : undefined,
      }))
      : [];
    cachedNews = { items, fetchedAt: Date.now() };
    return items.slice(0, limit);
  } catch (err) {
    app.log.error({ err }, 'Failed to fetch news, sending fallback');
    const fallback: NewsItem[] = [
      {
        title: 'AI-Driven Crypto Insights Push Market Higher',
        link: 'https://example.com/news/ai-driven-crypto',
        source: 'NOP Intelligence',
      },
      {
        title: 'Top Layer-2 Networks Record New Activity Highs',
        link: 'https://example.com/news/layer2-activity',
        source: 'NOP Intelligence',
      },
    ];
    cachedNews = { items: fallback, fetchedAt: Date.now() };
    return fallback.slice(0, limit);
  }
}

app.get('/api/news', async (request, reply) => {
  const limit = Number((request.query as Record<string, string>)?.limit ?? '12') || 12;
  const items = await loadNews(limit);
  return reply.send({ ok: true, items });
});

app.get('/api/ai/health', async (_, reply) => {
  return reply.send({ ok: true, status: 'healthy' });
});

app.post('/api/ai/chat', async (request, reply) => {
  const body = request.body as { messages?: ChatMessage[] };
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const lastUserMessage = [...messages].reverse().find((m: ChatMessage) => m.role === 'user');
  const userText = lastUserMessage?.content ?? 'Yeni bir mesaj bulunamadı.';

  return reply.send({
    ok: true,
    reply: `AI servisi devre dışı: Şu an için otomatik yanıt yerine bu mesajı iletmekteyiz. Kullanıcının son mesajı: "${userText}"`,
  });
});

async function startServer(startPort: number): Promise<void> {
  try {
    await app.listen({ port: startPort, host });
    app.log.info(`API on ${host}:${startPort}`);
  } catch (err: any) {
    if (err?.code === 'EADDRINUSE') {
      const nextPort = startPort + 1;
      app.log.warn(`Port ${startPort} in use, retrying on ${nextPort}...`);
      await startServer(nextPort);
      return;
    }
    throw err;
  }
}

async function bootstrap(): Promise<void> {
  const origins = process.env.ALLOW_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean);

  await app.register(cors, {
    origin: origins && origins.length > 0 ? origins : true,
  });

  await startServer(port);
}

bootstrap().catch((err) => {
  app.log.error(err);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, shutting down...`);
    await app.close();
    await pool.end();
    process.exit(0);
  });
}

export default app;
