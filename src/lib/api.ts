export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export async function apiGet(p: string, i?: RequestInit) {
  const r = await fetch(`${API_URL}${p}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...i,
  });
  if (!r.ok) throw new Error(`${r.status} ${p}`);
  return r.json();
}

export async function apiPost(p: string, b: any, i?: RequestInit) {
  const r = await fetch(`${API_URL}${p}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(b),
    ...i,
  });
  if (!r.ok) throw new Error(`${r.status} ${p}`);
  return r.json();
}

