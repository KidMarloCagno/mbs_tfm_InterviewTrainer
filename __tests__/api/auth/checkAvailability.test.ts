/**
 * GET /api/auth/check-availability — IMPORTANT TIER (≥80% coverage)
 *
 * Strategy:
 * - Import the route handler directly and call it with a NextRequest.
 * - Mock @/lib/prisma to avoid real DB calls.
 * - The route returns { available: boolean | null } for field/value combos
 *   and { error } with status 400 for unknown/missing field.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/auth/check-availability/route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost/api/auth/check-availability");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new NextRequest(url.toString());
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/auth/check-availability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Username field ───────────────────────────────────────────────────────

  it("returns { available: true } when username is valid and not taken", async () => {
    // Arrange
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );
    const req = makeRequest({ field: "username", value: "johndoe" });
    // Act
    const res = await GET(req);
    const json = await res.json();
    // Assert
    expect(res.status).toBe(200);
    expect(json).toEqual({ available: true });
  });

  it("returns { available: false } when username is already taken", async () => {
    // Arrange
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
    });
    const req = makeRequest({ field: "username", value: "existinguser" });
    // Act
    const res = await GET(req);
    const json = await res.json();
    // Assert
    expect(json).toEqual({ available: false });
  });

  it("returns { available: null } and skips DB for a username that is too short", async () => {
    // Arrange — "ab" is 2 chars, min is 3
    const req = makeRequest({ field: "username", value: "ab" });
    // Act
    const res = await GET(req);
    const json = await res.json();
    // Assert
    expect(json).toEqual({ available: null });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns { available: null } for a username with invalid characters", async () => {
    // Arrange — hyphens and spaces are not allowed
    const req = makeRequest({ field: "username", value: "bad-user name!" });
    // Act
    const res = await GET(req);
    const json = await res.json();
    // Assert
    expect(json).toEqual({ available: null });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("accepts a username of exactly 32 characters (boundary) and queries DB", async () => {
    // Arrange
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );
    const req = makeRequest({ field: "username", value: "a".repeat(32) });
    // Act
    await GET(req);
    // Assert — DB was queried (value passed schema validation)
    expect(prisma.user.findUnique).toHaveBeenCalledOnce();
  });

  // ─── Email field ──────────────────────────────────────────────────────────

  it("returns { available: true } when email is valid and not taken", async () => {
    // Arrange
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );
    const req = makeRequest({ field: "email", value: "new@example.com" });
    // Act
    const res = await GET(req);
    const json = await res.json();
    // Assert
    expect(json).toEqual({ available: true });
  });

  it("returns { available: false } when email is already registered", async () => {
    // Arrange
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-2",
    });
    const req = makeRequest({ field: "email", value: "taken@example.com" });
    // Act
    const res = await GET(req);
    const json = await res.json();
    // Assert
    expect(json).toEqual({ available: false });
  });

  it("returns { available: null } for a malformed email string", async () => {
    // Arrange
    const req = makeRequest({ field: "email", value: "not-an-email" });
    // Act
    const res = await GET(req);
    const json = await res.json();
    // Assert
    expect(json).toEqual({ available: null });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  // ─── Invalid / missing field ──────────────────────────────────────────────

  it("returns 400 when field param is missing", async () => {
    // Arrange — only value is provided, no field
    const req = makeRequest({ value: "johndoe" });
    // Act
    const res = await GET(req);
    const json = await res.json();
    // Assert
    expect(res.status).toBe(400);
    expect(json).toHaveProperty("error");
  });

  it("returns 400 for an unknown field value", async () => {
    // Arrange
    const req = makeRequest({ field: "phone", value: "555-1234" });
    // Act
    const res = await GET(req);
    const json = await res.json();
    // Assert
    expect(res.status).toBe(400);
    expect(json).toHaveProperty("error");
  });
});
