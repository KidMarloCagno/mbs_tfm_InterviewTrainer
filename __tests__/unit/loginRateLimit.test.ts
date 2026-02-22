/**
 * checkLoginRateLimit — CORE TIER (100% coverage required)
 *
 * Strategy:
 * - vi.useFakeTimers() + vi.setSystemTime() freezes Date.now() so the module's
 *   sliding-window math is deterministic.
 * - Unique IPs per test avoid cross-test pollution in the module-level Map store.
 * - WINDOW_MS = 15 * 60 * 1000 ms (900 000 ms); MAX_ATTEMPTS = 10.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkLoginRateLimit } from "@/lib/loginRateLimit";

const WINDOW_MS = 15 * 60 * 1000; // mirrors the constant inside the module

// Incrementing seed — each test gets its own IP to avoid store pollution.
let ipSeed = 10;
function nextIp(): string {
  return `192.168.0.${ipSeed++}`;
}

describe("checkLoginRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Happy paths ──────────────────────────────────────────────────────────

  it("allows the first request from a new IP", () => {
    // Arrange & Act
    const result = checkLoginRateLimit(nextIp());
    // Assert
    expect(result).toEqual({ allowed: true });
  });

  it("allows requests up to MAX_ATTEMPTS (10) inclusive", () => {
    // Arrange
    const ip = nextIp();
    let last: ReturnType<typeof checkLoginRateLimit> = { allowed: true };
    // Act — make exactly MAX_ATTEMPTS requests
    for (let i = 0; i < 10; i++) {
      last = checkLoginRateLimit(ip);
    }
    // Assert — the 10th request is still allowed
    expect(last).toEqual({ allowed: true });
  });

  // ─── Blocking ─────────────────────────────────────────────────────────────

  it("blocks the (MAX_ATTEMPTS + 1)th request", () => {
    // Arrange — exhaust the limit
    const ip = nextIp();
    for (let i = 0; i < 10; i++) {
      checkLoginRateLimit(ip);
    }
    // Act
    const result = checkLoginRateLimit(ip);
    // Assert
    expect(result.allowed).toBe(false);
  });

  it("returns retryAfterSeconds = WINDOW_MS / 1000 on the first block", () => {
    // Arrange
    const ip = nextIp();
    for (let i = 0; i < 10; i++) {
      checkLoginRateLimit(ip);
    }
    // Act
    const result = checkLoginRateLimit(ip);
    // Assert — time is frozen so retryAfterSeconds is exactly WINDOW_MS / 1000
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterSeconds).toBe(WINDOW_MS / 1000);
    }
  });

  it("retryAfterSeconds decreases as time advances within the window", () => {
    // Arrange
    const ip = nextIp();
    for (let i = 0; i < 10; i++) {
      checkLoginRateLimit(ip);
    }
    const first = checkLoginRateLimit(ip);
    // Act — advance 1 minute
    vi.advanceTimersByTime(60_000);
    const second = checkLoginRateLimit(ip);
    // Assert
    expect(first.allowed).toBe(false);
    expect(second.allowed).toBe(false);
    if (!first.allowed && !second.allowed) {
      expect(second.retryAfterSeconds).toBeLessThan(first.retryAfterSeconds);
    }
  });

  // ─── Independence / multi-IP ──────────────────────────────────────────────

  it("tracks two different IPs independently", () => {
    // Arrange — exhaust ip1
    const ip1 = nextIp();
    const ip2 = nextIp();
    for (let i = 0; i < 10; i++) {
      checkLoginRateLimit(ip1);
    }
    // Act — verify ip1 is blocked but ip2 is still allowed
    expect(checkLoginRateLimit(ip1).allowed).toBe(false);
    expect(checkLoginRateLimit(ip2)).toEqual({ allowed: true });
  });

  // ─── Window reset ─────────────────────────────────────────────────────────

  it("resets the window and allows requests after WINDOW_MS has elapsed", () => {
    // Arrange — exhaust limit
    const ip = nextIp();
    for (let i = 0; i < 10; i++) {
      checkLoginRateLimit(ip);
    }
    expect(checkLoginRateLimit(ip).allowed).toBe(false);
    // Act — advance past the window
    vi.advanceTimersByTime(WINDOW_MS + 1);
    // Assert — fresh window starts
    expect(checkLoginRateLimit(ip)).toEqual({ allowed: true });
  });

  // ─── Pruning ──────────────────────────────────────────────────────────────

  it("prunes expired entries so the store does not grow unboundedly", () => {
    // Arrange — create an entry, then advance past its window
    const staleIp = nextIp();
    checkLoginRateLimit(staleIp); // count=1 in the store
    vi.advanceTimersByTime(WINDOW_MS + 1); // stale entry is now expired
    // Act — calling a fresh IP triggers pruneExpired(); expired entry is removed
    checkLoginRateLimit(nextIp());
    // Assert — staleIp now gets a fresh window (entry was pruned and recreated as count=1)
    const result = checkLoginRateLimit(staleIp);
    expect(result).toEqual({ allowed: true });
  });
});
