/**
 * QuizPage completion screen — regression tests for savingProgress (v1.3.4)
 *
 * Root cause of the bug: POST /api/quiz/session was fire-and-forget, so
 * router.push("/dashboard") could race the DB write and the dashboard Server
 * Component would query UserProgress before it was committed.
 *
 * Fix: savingProgress state disables "Back to Topics" until the POST response
 * is received; navigation then uses globalThis.location.href (hard reload) to
 * bypass Next.js Router Cache, guaranteeing a fresh dashboard render.
 *
 * Strategy:
 * - useGameStore is fully mocked. resetSession and startSession use stable
 *   module-level vi.fn() refs (mock* prefix) so the loading useEffect's
 *   dependency array stays stable across re-renders — without this the effect
 *   would re-fire on every render and the component would oscillate between
 *   loading and completion screens.
 * - fetch is stubbed globally: GET resolves immediately; POST is deferred so
 *   each test controls when the save finishes.
 * - globalThis.location is replaced via Object.defineProperty — vi.stubGlobal
 *   does not penetrate jsdom's non-configurable location getter.
 * - GameEngine is stubbed to null; it is never rendered on the completion screen.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import QuizPage from "@/app/quiz/[category]/page";
import type { GameQuestion } from "@/components/game/GameEngine";

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Stable references — mock* prefix is required for Vitest to hoist these
// alongside vi.mock so the factory closure can access them without TDZ errors.
const mockResetSession = vi.fn();
const mockStartSession = vi.fn();
const mockAnsweredResults: Array<{ questionId: string; quality: 5 }> = [
  { questionId: "db-q001", quality: 5 },
];
const mockQuestion: GameQuestion = {
  id: "db-q001",
  question: "What is a primary key?",
  answer: "A unique identifier for each row",
  options: [
    "A unique identifier for each row",
    "A foreign key",
    "An index",
    "A constraint",
  ],
  category: "Database",
  type: "QUIZ_SIMPLE",
  level: "Beginner",
  explanation: "Primary keys uniquely identify rows.",
};

vi.mock("@/store/useGameStore", () => ({
  useGameStore: () => ({
    sessionQuestions: [mockQuestion],
    currentQuestionIndex: 0,
    score: 1,
    isFinished: true,
    answeredResults: mockAnsweredResults,
    // Stable refs prevent the loading useEffect from re-firing on every
    // render due to new function identities in the dependency array.
    startSession: mockStartSession,
    resetSession: mockResetSession,
    answerQuestion: vi.fn(),
    nextQuestion: vi.fn(),
  }),
}));

// Not rendered on the completion screen, stubbed to avoid import side-effects.
vi.mock("@/components/game/GameEngine", () => ({
  GameEngine: () => null,
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("QuizPage — completion screen / savingProgress race condition", () => {
  let locationMock: { href: string; reload: ReturnType<typeof vi.fn> };
  let resolveSessionPost: () => void;

  beforeEach(() => {
    vi.clearAllMocks();

    // Navigation mocks
    vi.mocked(useParams).mockReturnValue({ category: "Database" });
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === "count" ? "10" : "mixed"),
    } as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    // Replace globalThis.location — vi.stubGlobal does not penetrate
    // jsdom's non-configurable window.location, so Object.defineProperty
    // with configurable:true is required.
    locationMock = { href: "", reload: vi.fn() };
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      writable: true,
      value: locationMock,
    });

    // fetch stub:
    //   GET  /api/quiz/questions/… → resolves immediately (loading state ends)
    //   POST /api/quiz/session     → deferred; tests drive resolution
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("/api/quiz/questions")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ questions: [] }),
          });
        }
        // POST — caller resolves via resolveSessionPost()
        return new Promise((resolve) => {
          resolveSessionPost = () =>
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({ saved: 1 }),
            });
        });
      }),
    );
  });

  // ─── Completion screen renders ─────────────────────────────────────────────

  it("renders the completion heading", async () => {
    // Arrange & Act
    render(<QuizPage />);
    // Assert — findBy* waits for the loading state to clear
    expect(
      await screen.findByText("Session Complete · Tier Progress Updated"),
    ).toBeInTheDocument();
  });

  it("displays the session score", async () => {
    // Arrange & Act
    render(<QuizPage />);
    await screen.findByText("Session Complete · Tier Progress Updated");
    // Assert — score / total from store mock (1 correct out of 1 question)
    expect(screen.getByText("1/1")).toBeInTheDocument();
  });

  // ─── savingProgress — pending state ───────────────────────────────────────

  it("shows 'Saving progress…' while POST /api/quiz/session is in-flight", async () => {
    // Arrange & Act
    render(<QuizPage />);
    await screen.findByText("Session Complete · Tier Progress Updated");
    // Assert — status line shows saving indicator before POST resolves
    expect(screen.getByText("Saving progress…")).toBeInTheDocument();
  });

  it("'Back to Topics' button is disabled while POST is pending", async () => {
    // Arrange & Act
    render(<QuizPage />);
    await screen.findByText("Session Complete · Tier Progress Updated");
    // Assert — button label changes to "Saving…" and is disabled
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });

  // ─── savingProgress — resolved state ──────────────────────────────────────

  it("'Back to Topics' button is enabled after POST resolves", async () => {
    // Arrange
    render(<QuizPage />);
    await screen.findByText("Session Complete · Tier Progress Updated");
    // Act — resolve the deferred POST
    resolveSessionPost();
    // Assert
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Back to Topics" }),
      ).not.toBeDisabled();
    });
  });

  it("shows 'Progress saved…' status line after POST resolves", async () => {
    // Arrange
    render(<QuizPage />);
    await screen.findByText("Session Complete · Tier Progress Updated");
    // Act
    resolveSessionPost();
    // Assert
    await waitFor(() => {
      expect(
        screen.getByText(
          "Progress saved · Questions scheduled for spaced repetition review",
        ),
      ).toBeInTheDocument();
    });
  });

  // ─── Navigation — hard reload, not router.push ─────────────────────────────

  it("navigates via globalThis.location.href on 'Back to Topics', not router.push", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuizPage />);
    await screen.findByText("Session Complete · Tier Progress Updated");
    resolveSessionPost();
    const btn = await screen.findByRole("button", { name: "Back to Topics" });
    // Act
    await user.click(btn);
    // Assert — hard navigation bypasses Next.js Router Cache
    expect(locationMock.href).toBe("/dashboard");
    expect(vi.mocked(useRouter)().push).not.toHaveBeenCalledWith("/dashboard");
  });

  // ─── Run Again ────────────────────────────────────────────────────────────

  it("calls globalThis.location.reload when 'Run Again' is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuizPage />);
    await screen.findByText("Session Complete · Tier Progress Updated");
    // Act — Run Again does not need the save to complete first
    await user.click(screen.getByRole("button", { name: "Run Again" }));
    // Assert
    expect(locationMock.reload).toHaveBeenCalledOnce();
  });
});
