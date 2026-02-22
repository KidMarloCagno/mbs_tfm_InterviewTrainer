/**
 * GET /api/quiz/questions/[topic] — IMPORTANT TIER (≥80% coverage)
 *
 * Strategy:
 * - Import the GET handler directly; construct NextRequest with URL params.
 * - Mock next-auth (getServerSession), @/auth, @/lib/prisma, and
 *   @/lib/questions-data so no real DB or filesystem reads occur.
 * - Tests cover: auth guard, count clamping, type filter, SM-2 bucket
 *   ordering (overdue → fresh → scheduled), Remix mode (studied filter,
 *   topics param), and edge-case empty-pool handling.
 *
 * SM-2 bucket ordering note: shuffle() randomises within each bucket, so
 * we assert using arrayContaining / Set membership rather than exact order.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { GET } from "@/app/api/quiz/questions/[topic]/route";
import { prisma } from "@/lib/prisma";
import { getQuestionsByTopic, getAllQuestions } from "@/lib/questions-data";
import type { GameQuestion } from "@/components/game/GameEngine";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProgress: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/questions-data", () => ({
  getQuestionsByTopic: vi.fn(),
  getAllQuestions: vi.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SESSION = {
  user: { id: "user-1", name: "Test", email: "test@example.com" },
};

function makeQ(
  id: string,
  type: GameQuestion["type"] = "QUIZ_SIMPLE",
): GameQuestion {
  return {
    id,
    question: `Q ${id}`,
    answer: `A ${id}`,
    options: [`A ${id}`, "B", "C", "D"],
    category: "Test",
    type,
    level: "Beginner",
  };
}

function makeRequest(
  topic: string,
  params: Record<string, string> = {},
): NextRequest {
  const url = new URL(
    `http://localhost/api/quiz/questions/${encodeURIComponent(topic)}`,
  );
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/quiz/questions/[topic]", () => {
  beforeEach(() => {
    // resetAllMocks (not clearAllMocks) to also flush any unconsumed mockResolvedValueOnce
    // queues — otherwise leftover Once items from a previous test that returned early
    // (before consuming all queued values) leak into the next test.
    vi.resetAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(SESSION as any);
    (
      prisma.userProgress.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
  });

  // ─── Auth guard ───────────────────────────────────────────────────────────

  it("returns 401 when there is no active session", async () => {
    // Arrange
    vi.mocked(getServerSession).mockResolvedValue(null);
    const req = makeRequest("JavaScript");
    // Act
    const res = await GET(req, { params: { topic: "JavaScript" } });
    const json = await res.json();
    // Assert
    expect(res.status).toBe(401);
    expect(json).toHaveProperty("error", "Unauthorized.");
  });

  // ─── Unknown topic ────────────────────────────────────────────────────────

  it("returns 400 for an unknown topic (empty question set)", async () => {
    // Arrange
    vi.mocked(getQuestionsByTopic).mockReturnValue([]);
    const req = makeRequest("UnknownTopic");
    // Act
    const res = await GET(req, { params: { topic: "UnknownTopic" } });
    const json = await res.json();
    // Assert
    expect(res.status).toBe(400);
    expect(json).toHaveProperty("error", "Unknown topic.");
  });

  // ─── Count param clamping ─────────────────────────────────────────────────

  it("returns up to 10 questions by default (count=10)", async () => {
    // Arrange — 20 questions available, no progress
    const pool = Array.from({ length: 20 }, (_, i) => makeQ(`q${i}`));
    vi.mocked(getQuestionsByTopic).mockReturnValue(pool);
    const req = makeRequest("JavaScript");
    // Act
    const res = await GET(req, { params: { topic: "JavaScript" } });
    const { questions } = await res.json();
    // Assert
    expect(questions).toHaveLength(10);
  });

  it("respects count=20 param", async () => {
    // Arrange
    const pool = Array.from({ length: 25 }, (_, i) => makeQ(`q${i}`));
    vi.mocked(getQuestionsByTopic).mockReturnValue(pool);
    const req = makeRequest("JavaScript", { count: "20" });
    // Act
    const res = await GET(req, { params: { topic: "JavaScript" } });
    const { questions } = await res.json();
    // Assert
    expect(questions).toHaveLength(20);
  });

  it("clamps count=0 to 1", async () => {
    // Arrange
    const pool = Array.from({ length: 5 }, (_, i) => makeQ(`q${i}`));
    vi.mocked(getQuestionsByTopic).mockReturnValue(pool);
    const req = makeRequest("JavaScript", { count: "0" });
    // Act
    const res = await GET(req, { params: { topic: "JavaScript" } });
    const { questions } = await res.json();
    // Assert
    expect(questions).toHaveLength(1);
  });

  it("clamps count=999 to 30", async () => {
    // Arrange
    const pool = Array.from({ length: 40 }, (_, i) => makeQ(`q${i}`));
    vi.mocked(getQuestionsByTopic).mockReturnValue(pool);
    const req = makeRequest("JavaScript", { count: "999" });
    // Act
    const res = await GET(req, { params: { topic: "JavaScript" } });
    const { questions } = await res.json();
    // Assert
    expect(questions).toHaveLength(30);
  });

  // ─── Type filter ──────────────────────────────────────────────────────────

  it("filters to QUIZ_SIMPLE when type=QUIZ_SIMPLE is passed", async () => {
    // Arrange — mix of types
    const pool = [
      makeQ("qs-1", "QUIZ_SIMPLE"),
      makeQ("tf-1", "TRUE_FALSE"),
      makeQ("qs-2", "QUIZ_SIMPLE"),
    ];
    vi.mocked(getQuestionsByTopic).mockReturnValue(pool);
    const req = makeRequest("JavaScript", { type: "QUIZ_SIMPLE" });
    // Act
    const res = await GET(req, { params: { topic: "JavaScript" } });
    const { questions } = await res.json();
    // Assert — only QUIZ_SIMPLE questions returned
    expect(questions.every((q: GameQuestion) => q.type === "QUIZ_SIMPLE")).toBe(
      true,
    );
    expect(questions).toHaveLength(2);
  });

  it("returns all question types when type param is invalid/unknown", async () => {
    // Arrange
    const pool = [makeQ("qs-1", "QUIZ_SIMPLE"), makeQ("tf-1", "TRUE_FALSE")];
    vi.mocked(getQuestionsByTopic).mockReturnValue(pool);
    const req = makeRequest("JavaScript", { type: "invalid_type" });
    // Act
    const res = await GET(req, { params: { topic: "JavaScript" } });
    const { questions } = await res.json();
    // Assert — no filtering applied
    expect(questions).toHaveLength(2);
  });

  it("returns { questions: [] } (not 400) when type filter produces an empty pool", async () => {
    // Arrange — only TRUE_FALSE but filtering for FILL_THE_BLANK
    const pool = [makeQ("tf-1", "TRUE_FALSE")];
    vi.mocked(getQuestionsByTopic).mockReturnValue(pool);
    const req = makeRequest("JavaScript", { type: "FILL_THE_BLANK" });
    // Act
    const res = await GET(req, { params: { topic: "JavaScript" } });
    const json = await res.json();
    // Assert
    expect(res.status).toBe(200);
    expect(json).toEqual({ questions: [] });
  });

  // ─── SM-2 bucket ordering ─────────────────────────────────────────────────

  it("returns overdue questions before fresh ones before scheduled ones", async () => {
    // Arrange — 2 of each bucket type, count=6
    const dueQ = [makeQ("due-1"), makeQ("due-2")];
    const freshQ = [makeQ("fresh-1"), makeQ("fresh-2")];
    const schedQ = [makeQ("sched-1"), makeQ("sched-2")];
    const pool = [...dueQ, ...freshQ, ...schedQ];

    vi.mocked(getQuestionsByTopic).mockReturnValue(pool);

    const past = new Date(Date.now() - 86_400_000); // yesterday
    const future = new Date(Date.now() + 86_400_000); // tomorrow

    // Progress records: due-* are overdue, sched-* are scheduled, fresh-* have no record
    (
      prisma.userProgress.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      { questionId: "due-1", nextReview: past },
      { questionId: "due-2", nextReview: past },
      { questionId: "sched-1", nextReview: future },
      { questionId: "sched-2", nextReview: future },
    ]);

    const req = makeRequest("JavaScript", { count: "6" });
    // Act
    const res = await GET(req, { params: { topic: "JavaScript" } });
    const { questions } = await res.json();
    const ids: string[] = questions.map((q: GameQuestion) => q.id);

    // Assert — first 2 are from the due bucket
    expect(new Set(ids.slice(0, 2))).toEqual(new Set(["due-1", "due-2"]));
    // next 2 are fresh
    expect(new Set(ids.slice(2, 4))).toEqual(new Set(["fresh-1", "fresh-2"]));
    // last 2 are scheduled
    expect(new Set(ids.slice(4, 6))).toEqual(new Set(["sched-1", "sched-2"]));
  });

  // ─── Remix mode ───────────────────────────────────────────────────────────

  it("returns empty questions array for Remix when user has no study history", async () => {
    // Arrange — getAllQuestions returns questions but user has studied none
    vi.mocked(getAllQuestions).mockReturnValue([makeQ("js-1"), makeQ("db-1")]);
    // First findMany: studiedRecords → empty
    // Second findMany: SM-2 progress → empty (no pool)
    (prisma.userProgress.findMany as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([]) // studiedRecords
      .mockResolvedValueOnce([]); // SM-2 progress
    const req = makeRequest("Remix");
    // Act
    const res = await GET(req, { params: { topic: "Remix" } });
    const { questions } = await res.json();
    // Assert
    expect(questions).toEqual([]);
  });

  it("returns only studied questions in Remix mode (no topics filter)", async () => {
    // Arrange — user studied js-1 but not db-1
    const jsQ = makeQ("js-1");
    const dbQ = makeQ("db-1");
    vi.mocked(getAllQuestions).mockReturnValue([jsQ, dbQ]);
    (prisma.userProgress.findMany as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([{ questionId: "js-1" }]) // studiedRecords
      .mockResolvedValueOnce([]); // SM-2 progress
    const req = makeRequest("Remix");
    // Act
    const res = await GET(req, { params: { topic: "Remix" } });
    const { questions } = await res.json();
    // Assert
    expect(questions).toHaveLength(1);
    expect(questions[0].id).toBe("js-1");
  });

  it("filters to selected topics when topics param is provided in Remix mode", async () => {
    // Arrange — user studied both; topics=JavaScript narrows to js-1 only
    const jsQ = makeQ("js-1");
    const dbQ = makeQ("db-1");
    vi.mocked(getAllQuestions).mockReturnValue([jsQ, dbQ]);
    // getQuestionsByTopic called for the topics filter
    vi.mocked(getQuestionsByTopic).mockReturnValue([jsQ]);
    (prisma.userProgress.findMany as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([{ questionId: "js-1" }, { questionId: "db-1" }]) // studiedRecords
      .mockResolvedValueOnce([]); // SM-2 progress
    const req = makeRequest("Remix", { topics: "JavaScript" });
    // Act
    const res = await GET(req, { params: { topic: "Remix" } });
    const { questions } = await res.json();
    // Assert
    expect(questions).toHaveLength(1);
    expect(questions[0].id).toBe("js-1");
  });
});
