// Use centralized API base helper
function getApiBase() {
  const b = process.env.NEXT_PUBLIC_API_BASE?.trim();
  return b && b.length ? b : 'http://localhost:5000';
}
const BASE = getApiBase();
const FETCH_TIMEOUT = 10000; // 10 seconds

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${FETCH_TIMEOUT}ms`);
    }
    throw error;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const r = await fetchWithTimeout(`${BASE}${path}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`GET ${path} ${r.status}`);
  return r.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const r = await fetchWithTimeout(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${path} ${r.status}`);
  return r.json();
}
