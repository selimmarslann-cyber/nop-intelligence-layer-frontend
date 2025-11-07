/**
 * Centralized API base URL management
 * Handles both SSR and CSR environments
 */
export function getApiBase(): string {
  const b = process.env.NEXT_PUBLIC_API_BASE?.trim();
  return b && b.length ? b : (typeof window === 'undefined' ? 'http://localhost:5000' : 'http://localhost:5000');
}

