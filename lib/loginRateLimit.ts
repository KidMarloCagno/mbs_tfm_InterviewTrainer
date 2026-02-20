// Login brute-force protection (OWASP A07).
// Limits sign-in attempts to MAX_ATTEMPTS per IP within a sliding window.
// NOTE: In-process store only — on Vercel serverless multiple instances may
// run concurrently, so this is a best-effort limit rather than a hard global cap.

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10; // more permissive than registration (users mistype passwords)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function pruneExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkLoginRateLimit(ip: string): RateLimitResult {
  pruneExpired();

  const now = Date.now();
  const existing = store.get(ip);

  if (!existing || now >= existing.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (existing.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true };
}
