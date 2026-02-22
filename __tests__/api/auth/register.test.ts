/**
 * POST /api/auth/register — IMPORTANT TIER (≥80% coverage)
 *
 * Strategy:
 * - Import the route handler directly and call it with a NextRequest.
 * - Mock @/lib/prisma, @/lib/registerRateLimit, and bcryptjs to isolate
 *   the route logic from external dependencies.
 * - The handler applies rate limiting → validation → hashing → DB write,
 *   returning a generic error at each failure point (OWASP A01/A07).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/registerRateLimit";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { create: vi.fn() },
  },
}));

vi.mock("@/lib/registerRateLimit", () => ({
  checkRateLimit: vi.fn(),
}));

// bcryptjs default export — hash must not actually run during tests
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("$2b$12$hashed_password") },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const validBody = {
  username: "johndoe",
  email: "john@example.com",
  password: "SecurePass1!",
};

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: rate limit allows, DB create succeeds
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue({
      allowed: true,
    });
    (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
    });
  });

  // ─── Success ──────────────────────────────────────────────────────────────

  it('returns 201 { message: "Account created." } on successful registration', async () => {
    // Arrange
    const req = makeRequest(validBody);
    // Act
    const res = await POST(req);
    const json = await res.json();
    // Assert
    expect(res.status).toBe(201);
    expect(json).toEqual({ message: "Account created." });
  });

  it("calls prisma.user.create with the username, email, and a hashed password", async () => {
    // Arrange
    const req = makeRequest(validBody);
    // Act
    await POST(req);
    // Assert
    expect(prisma.user.create).toHaveBeenCalledOnce();
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: validBody.username,
          email: validBody.email,
          passwordHash: "$2b$12$hashed_password",
        }),
      }),
    );
  });

  // ─── Rate limiting ────────────────────────────────────────────────────────

  it("returns 429 with Retry-After header when the IP is rate-limited", async () => {
    // Arrange
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValue({
      allowed: false,
      retryAfterSeconds: 60,
    });
    const req = makeRequest(validBody);
    // Act
    const res = await POST(req);
    const json = await res.json();
    // Assert
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(json).toHaveProperty("error");
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("extracts the client IP from x-forwarded-for (first entry wins)", async () => {
    // Arrange — simulate a proxy chain
    const req = makeRequest(validBody, {
      "x-forwarded-for": "1.2.3.4, 10.0.0.1",
    });
    // Act
    await POST(req);
    // Assert — checkRateLimit was called with the first IP
    expect(checkRateLimit).toHaveBeenCalledWith("1.2.3.4");
  });

  it('falls back to "unknown" when x-forwarded-for header is absent', async () => {
    // Arrange — no IP header
    const req = makeRequest(validBody);
    // Act
    await POST(req);
    // Assert
    expect(checkRateLimit).toHaveBeenCalledWith("unknown");
  });

  // ─── Input validation ─────────────────────────────────────────────────────

  it("returns 400 for an unparseable JSON body", async () => {
    // Arrange
    const req = new NextRequest("http://localhost/api/auth/register", {
      method: "POST",
      body: "this is not json{{",
      headers: { "Content-Type": "application/json" },
    });
    // Act
    const res = await POST(req);
    // Assert
    expect(res.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("returns 400 (generic) when username is too short", async () => {
    // Arrange
    const req = makeRequest({ ...validBody, username: "ab" });
    // Act
    const res = await POST(req);
    const json = await res.json();
    // Assert — generic message, no field hint (OWASP A01)
    expect(res.status).toBe(400);
    expect(json.error).not.toMatch(/username/i);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("returns 400 when password has no uppercase letter", async () => {
    // Arrange
    const req = makeRequest({ ...validBody, password: "alllowercase1!" });
    // Act
    const res = await POST(req);
    // Assert
    expect(res.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("returns 400 when password has no special character", async () => {
    // Arrange
    const req = makeRequest({ ...validBody, password: "NoSpecialChar123" });
    // Act
    const res = await POST(req);
    // Assert
    expect(res.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  // ─── DB error handling ────────────────────────────────────────────────────

  it("returns 409 (generic) on Prisma P2002 unique constraint violation", async () => {
    // Arrange — simulate duplicate username/email
    (prisma.user.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      Object.assign(new Error("Unique constraint"), { code: "P2002" }),
    );
    const req = makeRequest(validBody);
    // Act
    const res = await POST(req);
    const json = await res.json();
    // Assert — generic message prevents enumeration (OWASP A01)
    expect(res.status).toBe(409);
    expect(json.error).not.toMatch(/username|email/i);
  });

  it("returns 500 on an unexpected DB error", async () => {
    // Arrange
    (prisma.user.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Connection lost"),
    );
    const req = makeRequest(validBody);
    // Act
    const res = await POST(req);
    // Assert
    expect(res.status).toBe(500);
  });
});
