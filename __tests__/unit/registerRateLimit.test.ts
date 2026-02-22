/**
 * checkRateLimit (register) — CORE TIER (100% coverage required)
 *
 * Strategy: mirrors loginRateLimit.test.ts but with MAX_ATTEMPTS = 5.
 * - vi.useFakeTimers() + vi.setSystemTime() for deterministic Date.now().
 * - Unique IPs per test to avoid cross-test Map store pollution.
 * - WINDOW_MS = 15 * 60 * 1000 ms; MAX_ATTEMPTS = 5.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit } from "@/lib/registerRateLimit";

const WINDOW_MS = 15 * 60 * 1000;

let ipSeed = 100;
function nextIp(): string {
  return `10.1.0.${ipSeed++}`;
}

describe("checkRateLimit (register)", () => {
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
    const result = checkRateLimit(nextIp());
    // Assert
    expect(result).toEqual({ allowed: true });
  });

  it("allows requests up to MAX_ATTEMPTS (5) inclusive", () => {
    // Arrange
    const ip = nextIp();
    let last: ReturnType<typeof checkRateLimit> = { allowed: true };
    // Act — make exactly MAX_ATTEMPTS requests
    for (let i = 0; i < 5; i++) {
      last = checkRateLimit(ip);
    }
    // Assert — the 5th request is still allowed
    expect(last).toEqual({ allowed: true });
  });

  // ─── Blocking ─────────────────────────────────────────────────────────────

  it("blocks the (MAX_ATTEMPTS + 1)th request", () => {
    // Arrange — exhaust the limit
    const ip = nextIp();
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip);
    }
    // Act
    const result = checkRateLimit(ip);
    // Assert
    expect(result.allowed).toBe(false);
  });

  it("returns retryAfterSeconds = WINDOW_MS / 1000 on the first block", () => {
    // Arrange
    const ip = nextIp();
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip);
    }
    // Act
    const result = checkRateLimit(ip);
    // Assert — time is frozen so value is exactly 900
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterSeconds).toBe(WINDOW_MS / 1000);
    }
  });

  it("retryAfterSeconds decreases as time advances within the window", () => {
    // Arrange
    const ip = nextIp();
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip);
    }
    const first = checkRateLimit(ip);
    // Act — advance 2 minutes
    vi.advanceTimersByTime(2 * 60_000);
    const second = checkRateLimit(ip);
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
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip1);
    }
    // Act
    expect(checkRateLimit(ip1).allowed).toBe(false);
    expect(checkRateLimit(ip2)).toEqual({ allowed: true });
  });

  // ─── Window reset ─────────────────────────────────────────────────────────

  it("resets the window and allows requests after WINDOW_MS has elapsed", () => {
    // Arrange — exhaust limit
    const ip = nextIp();
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip).allowed).toBe(false);
    // Act
    vi.advanceTimersByTime(WINDOW_MS + 1);
    // Assert
    expect(checkRateLimit(ip)).toEqual({ allowed: true });
  });

  // ─── Pruning ──────────────────────────────────────────────────────────────

  it("prunes expired entries on subsequent calls", () => {
    // Arrange — create a stale entry, let it expire
    const staleIp = nextIp();
    checkRateLimit(staleIp);
    vi.advanceTimersByTime(WINDOW_MS + 1);
    // Act — calling a fresh IP triggers pruneExpired()
    checkRateLimit(nextIp());
    // Assert — staleIp starts fresh (was pruned)
    expect(checkRateLimit(staleIp)).toEqual({ allowed: true });
  });
});
