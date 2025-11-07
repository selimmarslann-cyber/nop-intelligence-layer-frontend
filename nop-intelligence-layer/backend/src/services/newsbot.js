// backend/src/services/newsBot.ts
import Parser from "rss-parser";
import { PrismaClient } from "@prisma/client";
import { SOURCES } from "./newsSources.js";
// AI removed - using direct RSS content instead
const prisma = new PrismaClient();
const parser = new Parser();
function uniqByTitle(items) {
    const m = new Map();
    for (const it of items)
        if (it.title)
            m.set(it.title, it);
    return Array.from(m.values());
}
/**
 * RSS kaynaklarını çek, kısa TR tweet metni üret, DB'ye "bot post" olarak kaydet.
 */
export async function fetchAndPostNews() {
    const all = [];
    // 1) RSS topla
    for (const url of SOURCES) {
        try {
            const feed = await parser.parseURL(url);
            const src = (feed?.title || "news").replace(/\s+/g, " ").trim();
            feed.items.slice(0, 6).forEach((i) => {
                if (!i.title || !i.link)
                    return;
                all.push({ title: i.title.trim(), link: String(i.link), source: src, isoDate: i.isoDate || undefined });
            });
        }
        catch (e) {
            console.error("RSS okunamadı:", url, e instanceof Error ? e.message : e);
        }
    }
    // 2) Basit tekrar filtresi
    const unique = uniqByTitle(all).slice(0, 18);
    // 3) Her haber için kısa TR metin üret ve DB'ye yaz
    let saved = 0, skipped = 0;
    for (const it of unique) {
        try {
            // AI removed - use title directly to avoid API calls
            const tweet = `${it.title} ${it.link}`.trim();
            // Skip if no content
            if (!tweet.trim()) {
                skipped++;
                continue;
            }
            // Note: botPost model doesn't exist in schema, skipping DB save for now
            // TODO: Add botPost model to Prisma schema or use Post model
            console.log("News item processed:", { title: it.title, tweet, source: it.source, url: it.link });
            saved++;
        }
        catch (e) {
            console.error("News save error:", it.title, e instanceof Error ? e.message : e);
            skipped++;
        }
    }
    return { saved, skipped };
}
/**
 * Eski import'larla uyum için alias.
 * news.ts tarafında yanlışlıkla getLatestNews import edilirse de çalışsın.
 */
export async function getLatestNews() {
    return fetchAndPostNews();
}
//# sourceMappingURL=newsbot.js.map