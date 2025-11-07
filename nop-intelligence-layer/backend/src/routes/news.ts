import fastify from "fastify";
type FastifyInstance = ReturnType<typeof fastify>;

import Parser from "rss-parser";

type NewsItem = { title: string; url: string; image?: string; source?: string; publishedAt?: string; };

const rssCache: { data: NewsItem[]; ts: number } = { data: [], ts: 0 };

const RSS_SOURCES = [
  { name: 'Decrypt', url: 'https://decrypt.co/feed' }
];

function extractImage(entry: any): string | undefined {
  // 1) enclosure / media:content
  const enc = (entry.enclosure && (entry.enclosure.url || entry.enclosure.link)) || entry['media:content']?.url || entry['media:thumbnail']?.url;
  if (enc) return String(enc);
  
  // 2) content / contentSnippet içinden <img src="...">
  const html = String(entry['content:encoded'] || entry.content || '');
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m && m[1]) return m[1];
  
  return undefined;
}

async function fetchRssItems(limit: number): Promise<NewsItem[]> {
  const now = Date.now();
  if (now - rssCache.ts < 15 * 60 * 1000 && rssCache.data.length) {
    return rssCache.data.slice(0, limit); // 15 dk cache
  }

  const parser = new Parser();
  const all: NewsItem[] = [];

  for (const s of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(s.url);
      for (const it of (feed.items || []).slice(0, 10)) {
        all.push({
          title: String(it.title || '').trim(),
          url: String(it.link || it.guid || '').trim(),
          image: extractImage(it),
          source: s.name,
          publishedAt: (it.isoDate || it.pubDate) ? new Date(it.isoDate || it.pubDate as any).toISOString() : undefined
        });
      }
    } catch (e) {
      console.error('RSS_FAIL', s.name, (e as any)?.message || e);
    }
  }

  // tarihe göre sırala ve double'ları temizle
  const uniq = new Map<string, NewsItem>();
  all.sort((a, b) => (b.publishedAt ? Date.parse(b.publishedAt) : 0) - (a.publishedAt ? Date.parse(a.publishedAt) : 0));
  
  for (const x of all) {
    if (!x.url) continue;
    if (!uniq.has(x.url)) uniq.set(x.url, x);
  }

  const list = Array.from(uniq.values());
  rssCache.data = list;
  rssCache.ts = now;
  return list.slice(0, limit);
}

export async function newsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/news', async (req, reply) => {
    const q = (req.query as any) ?? {};
    const limit = Math.min(parseInt(q.limit ?? '4', 10) || 4, 8);
    
    try {
      const items = await fetchRssItems(limit);
      return reply.send({ items });
    } catch (e: any) {
      console.error('NEWS_ERROR', e?.message || e);
      return reply.status(500).send({ items: [] });
    }
  });
}
