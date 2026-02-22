/**
 * GameEngine component tests — IMPORTANT TIER
 *
 * Strategy:
 * - GameEngine is a pure switch dispatcher. It receives a GameQuestion and renders
 *   the appropriate child component based on question.type.
 * - Test each branch of the switch:
 *     · QUIZ_SIMPLE   → renders QuizSimple (shows "Quick Quiz" heading)
 *     · TRUE_FALSE    → renders TrueFalse  (shows "True / False Sprint" heading)
 *     · FILL_THE_BLANK → renders QuizSimple with title="Fill in the blank"
 *     · default (unknown type) → renders fallback error div
 * - onAnswered callback is forwarded — tested via a user interaction in QuizSimple.
 *
 * Note: child components (QuizSimple, TrueFalse) are NOT mocked so the routing
 * logic is verified by their rendered headings.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameEngine, type GameQuestion } from "@/components/game/GameEngine";

// ─── Shared fixture ───────────────────────────────────────────────────────────

const base: Omit<GameQuestion, "type"> = {
  id: "q-test",
  question: "What is a closure?",
  answer: "A function with access to its outer scope",
  options: [
    "A function with access to its outer scope",
    "A loop construct",
    "A CSS property",
    "A database index",
  ],
  category: "JavaScript",
  level: "Intermediate",
  explanation: "Closures capture variables from enclosing scopes.",
};

function makeQuestion(type: GameQuestion["type"] | string): GameQuestion {
  return { ...base, type: type as GameQuestion["type"] };
}

describe("GameEngine", () => {
  // ─── QUIZ_SIMPLE branch ───────────────────────────────────────────────────

  it("renders QuizSimple for QUIZ_SIMPLE type", () => {
    // Arrange & Act
    render(
      <GameEngine
        question={makeQuestion("QUIZ_SIMPLE")}
        onAnswered={vi.fn()}
      />,
    );
    // Assert — QuizSimple renders with its default heading
    expect(screen.getByText("Quick Quiz")).toBeInTheDocument();
  });

  it("displays the question text for QUIZ_SIMPLE", () => {
    // Arrange & Act
    render(
      <GameEngine
        question={makeQuestion("QUIZ_SIMPLE")}
        onAnswered={vi.fn()}
      />,
    );
    // Assert
    expect(screen.getByText("What is a closure?")).toBeInTheDocument();
  });

  // ─── TRUE_FALSE branch ────────────────────────────────────────────────────

  it("renders TrueFalse for TRUE_FALSE type", () => {
    // Arrange & Act
    render(
      <GameEngine question={makeQuestion("TRUE_FALSE")} onAnswered={vi.fn()} />,
    );
    // Assert — TrueFalse renders its heading
    expect(screen.getByText("True / False Sprint")).toBeInTheDocument();
  });

  it("renders True and False buttons for TRUE_FALSE type", () => {
    // Arrange & Act
    render(
      <GameEngine question={makeQuestion("TRUE_FALSE")} onAnswered={vi.fn()} />,
    );
    // Assert
    expect(screen.getByRole("button", { name: "True" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "False" })).toBeInTheDocument();
  });

  // ─── FILL_THE_BLANK branch ────────────────────────────────────────────────

  it('renders QuizSimple with "Fill in the blank" title for FILL_THE_BLANK type', () => {
    // Arrange & Act
    render(
      <GameEngine
        question={makeQuestion("FILL_THE_BLANK")}
        onAnswered={vi.fn()}
      />,
    );
    // Assert — same component as QUIZ_SIMPLE but with different title prop
    expect(screen.getByText("Fill in the blank")).toBeInTheDocument();
  });

  it('FILL_THE_BLANK does NOT render "Quick Quiz" heading', () => {
    // Arrange & Act
    render(
      <GameEngine
        question={makeQuestion("FILL_THE_BLANK")}
        onAnswered={vi.fn()}
      />,
    );
    // Assert
    expect(screen.queryByText("Quick Quiz")).not.toBeInTheDocument();
  });

  // ─── Default / unknown branch ─────────────────────────────────────────────

  it("renders the fallback error for an unrecognised question type", () => {
    // Arrange & Act — bypass TypeScript by casting to any
    render(
      <GameEngine
        question={makeQuestion("UNKNOWN_TYPE" as never)}
        onAnswered={vi.fn()}
      />,
    );
    // Assert
    expect(screen.getByText("Unsupported question type.")).toBeInTheDocument();
  });

  // ─── onAnswered forwarding ────────────────────────────────────────────────

  it("forwards onAnswered callback to QuizSimple — fires on option click", async () => {
    // Arrange
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    render(
      <GameEngine
        question={makeQuestion("QUIZ_SIMPLE")}
        onAnswered={onAnswered}
      />,
    );
    // Act — click the correct answer option
    await user.click(
      screen.getByRole("button", {
        name: "A function with access to its outer scope",
      }),
    );
    // Assert
    expect(onAnswered).toHaveBeenCalledOnce();
    expect(onAnswered).toHaveBeenCalledWith(true, 5); // correct → quality 5
  });
});
