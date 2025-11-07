// 📁 utils/api.js
// Fastify backend bağlandığında kullanacağız.
// Use centralized API base
function getApiBase() {
  const b = process.env.NEXT_PUBLIC_API_BASE?.trim();
  return b && b.length ? b : 'http://localhost:5000';
}
const API_BASE = getApiBase();
const FETCH_TIMEOUT = 10000; // 10 seconds

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${FETCH_TIMEOUT}ms`);
    }
    throw error;
  }
}

export async function getJSON(path){
  const res = await fetchWithTimeout(`${API_BASE}${path}`);
  if(!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}

export async function postJSON(path, body){
  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body||{})
  });
  if(!res.ok) throw new Error(`POST ${path} ${res.status}`);
  return res.json();
}
