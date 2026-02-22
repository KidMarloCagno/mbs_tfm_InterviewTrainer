/**
 * POST /api/quiz/session — IMPORTANT TIER (≥80% coverage)
 *
 * Strategy:
 * - Import the POST handler directly; build NextRequest with JSON body.
 * - Mock next-auth, @/auth, and @/lib/prisma.
 * - calculateSM2 is NOT mocked: its output is used to verify that the
 *   route feeds the correct SM-2 values into prisma.userProgress.upsert.
 * - Covers: auth guard, body validation, success flow, SM-2 integration,
 *   upsert-failure skip behaviour, lastActivity update.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { POST } from "@/app/api/quiz/session/route";
import { prisma } from "@/lib/prisma";
import { calculateSM2 } from "@/lib/sm2";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProgress: { findMany: vi.fn(), upsert: vi.fn() },
    user: { update: vi.fn() },
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SESSION = { user: { id: "user-1" } };

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/quiz/session", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/quiz/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(SESSION as any);
    (
      prisma.userProgress.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    (prisma.userProgress.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "p-1",
    });
    (prisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
    });
  });

  // ─── Auth guard ───────────────────────────────────────────────────────────

  it("returns 401 when there is no active session", async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue(null);
    const req = makeRequest({ results: [{ questionId: "q1", quality: 5 }] });
    // Act
    const res = await POST(req);
    const json = await res.json();
    // Assert
    expect(res.status).toBe(401);
    expect(json).toHaveProperty("error", "Unauthorized.");
  });

  // ─── Body validation ──────────────────────────────────────────────────────

  it("returns 400 for an unparseable JSON body", async () => {
    // Arrange
    const req = new NextRequest("http://localhost/api/quiz/session", {
      method: "POST",
      body: "{{not json",
      headers: { "Content-Type": "application/json" },
    });
    // Act
    const res = await POST(req);
    const json = await res.json();
    // Assert
    expect(res.status).toBe(400);
    expect(json).toHaveProperty("error", "Invalid request body.");
  });

  it("returns 400 when results array is empty", async () => {
    // Arrange
    const req = makeRequest({ results: [] });
    // Act
    const res = await POST(req);
    const json = await res.json();
    // Assert
    expect(res.status).toBe(400);
    expect(json).toHaveProperty("error", "Invalid session data.");
  });

  it("returns 400 when results array has more than 20 items", async () => {
    // Arrange
    const results = Array.from({ length: 21 }, (_, i) => ({
      questionId: `q${i}`,
      quality: 5,
    }));
    const req = makeRequest({ results });
    // Act
    const res = await POST(req);
    // Assert
    expect(res.status).toBe(400);
  });

  // ─── Success flow ─────────────────────────────────────────────────────────

  it("returns 200 with { saved, scheduled } on a valid request (no prior progress)", async () => {
    // Arrange — fresh question, no existing UserProgress
    const req = makeRequest({ results: [{ questionId: "q1", quality: 4 }] });
    // Act
    const res = await POST(req);
    const json = await res.json();
    // Assert
    expect(res.status).toBe(200);
    expect(json).toMatchObject({ saved: 1, scheduled: expect.any(Array) });
    expect(json.scheduled).toHaveLength(1);
    expect(json.scheduled[0]).toMatchObject({
      questionId: "q1",
      interval: expect.any(Number),
      nextReview: expect.any(String),
    });
  });

  it("calls prisma.userProgress.upsert once per result item", async () => {
    // Arrange
    const req = makeRequest({
      results: [
        { questionId: "q1", quality: 5 },
        { questionId: "q2", quality: 3 },
      ],
    });
    // Act
    await POST(req);
    // Assert
    expect(prisma.userProgress.upsert).toHaveBeenCalledTimes(2);
  });

  it("calls prisma.user.update (lastActivity) exactly once, outside the question loop", async () => {
    // Arrange — 3 questions
    const req = makeRequest({
      results: [
        { questionId: "q1", quality: 5 },
        { questionId: "q2", quality: 2 },
        { questionId: "q3", quality: 4 },
      ],
    });
    // Act
    await POST(req);
    // Assert — update called only once regardless of question count
    expect(prisma.user.update).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({ lastActivity: expect.any(Date) }),
      }),
    );
  });

  // ─── SM-2 integration ─────────────────────────────────────────────────────

  it("upserts with SM-2 interval > previous when quality=5 and prior progress exists", async () => {
    // Arrange — existing progress with interval=3, repetition=2
    const prevProgress = {
      userId: "user-1",
      questionId: "q1",
      interval: 3,
      repetition: 2,
      easinessFactor: 2.5,
      nextReview: new Date(),
    };
    (
      prisma.userProgress.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([prevProgress]);

    const expectedSM2 = calculateSM2({
      quality: 5,
      previousInterval: 3,
      previousRepetition: 2,
      previousEF: 2.5,
    });

    const req = makeRequest({ results: [{ questionId: "q1", quality: 5 }] });
    // Act
    await POST(req);
    // Assert — upsert was called with the exact SM-2 output
    expect(prisma.userProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ interval: expectedSM2.interval }),
      }),
    );
    expect(expectedSM2.interval).toBeGreaterThan(3);
  });

  it("upserts with interval=1 when quality=0 (blackout resets SM-2)", async () => {
    // Arrange — existing progress with interval=6
    const prevProgress = {
      userId: "user-1",
      questionId: "q1",
      interval: 6,
      repetition: 3,
      easinessFactor: 2.5,
      nextReview: new Date(),
    };
    (
      prisma.userProgress.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([prevProgress]);

    const expectedSM2 = calculateSM2({
      quality: 0,
      previousInterval: 6,
      previousRepetition: 3,
      previousEF: 2.5,
    });

    const req = makeRequest({ results: [{ questionId: "q1", quality: 0 }] });
    // Act
    await POST(req);
    // Assert
    expect(prisma.userProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ interval: expectedSM2.interval }),
      }),
    );
    expect(expectedSM2.interval).toBe(1);
  });

  // ─── Upsert-failure skip behaviour ────────────────────────────────────────

  it("skips a question silently when upsert throws (question not in DB)", async () => {
    // Arrange — upsert rejects (e.g. FK constraint, question not seeded)
    (prisma.userProgress.upsert as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Foreign key constraint failed"),
    );
    const req = makeRequest({
      results: [{ questionId: "unknown-q", quality: 5 }],
    });
    // Act
    const res = await POST(req);
    const json = await res.json();
    // Assert — saved=0 but no 500 error; lastActivity still updated
    expect(res.status).toBe(200);
    expect(json.saved).toBe(0);
    expect(json.scheduled).toEqual([]);
    expect(prisma.user.update).toHaveBeenCalledOnce();
  });
});
