// backend/src/cron.ts
import { fetchAndPostNews } from "./services/newsbot.js";

export function startCron(opts: { everyMs?: number; jitterMs?: number } = {}) {
  const every = opts.everyMs ?? 300000;  // default 5 dk
  const jitter = opts.jitterMs ?? 0;

  async function tick() {
    try {
      await fetchAndPostNews(); // daha az item
    } catch (e) {
      console.error("News cron error:", e);
    } finally {
      const j = Math.floor(Math.random() * (jitter + 1));
      setTimeout(tick, every + j);
    }
  }
  setTimeout(tick, 2000); // başlangıçta 2 sn sonra
}
