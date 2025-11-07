// lib/sanity.ts
/**
 * Sanity (GROQ) client ve fetch helper.
 *
 * Gereksinimler:
 *   - @sanity/client  (npm i @sanity/client)
 *   - .env.local içinde:
 *        SANITY_TOKEN=YOUR_SANITY_WRITE_TOKEN
 *        NEXT_PUBLIC_SANITY_PROJECT_ID=YOUR_PROJECT_ID
 *        NEXT_PUBLIC_SANITY_DATASET=production   // ya da development
 */

import { createClient, type SanityClient } from '@sanity/client';

// ---------------------------------------------------------------------
// Ortam değişkenleri
// ---------------------------------------------------------------------
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const TOKEN      = process.env.SANITY_TOKEN; // server‑only

// ---------------------------------------------------------------------
// Sanity client oluştur (lazy initialization to avoid build errors)
// ---------------------------------------------------------------------
let _sanityClient: SanityClient | null = null;

function getSanityClient(): SanityClient | null {
  if (!PROJECT_ID) {
    return null;
  }
  if (!_sanityClient) {
    _sanityClient = createClient({
      projectId: PROJECT_ID,
      dataset:   DATASET,
      token:     TOKEN,               // undefined ise sadece read‑only (CDN) kullanılır
      apiVersion: '2023-12-01',       // sabit bir sürüm, geriye dönük uyumluluk
      useCdn: false,                 // false → en güncel veri
    });
  }
  return _sanityClient;
}

// Export function instead of client to avoid module-load initialization
export function getClient(): SanityClient | null {
  return getSanityClient();
}

// ---------------------------------------------------------------------
// fetchGROQ wrapper – hataları yakalar, console’da gösterir
// ---------------------------------------------------------------------
export async function fetchGROQ<T = any>(
  query: string,
  params?: Record<string, any>
): Promise<T> {
  const client = getSanityClient();
  if (!client) {
    console.warn('Sanity client not configured, returning empty array');
    return [] as T;
  }
  try {
    if (params) {
      return await client.fetch<T>(query, params);
    } else {
      return await client.fetch<T>(query);
    }
  } catch (err) {
    console.error('❌ GROQ fetch error →', err);
    throw err;
  }
}
