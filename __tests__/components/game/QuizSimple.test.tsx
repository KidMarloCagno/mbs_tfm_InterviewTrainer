/**
 * QuizSimple component tests — IMPORTANT TIER (core game loop)
 *
 * Strategy:
 * - Render initial state: question text, all options, category, level badge.
 * - Default title is "Quick Quiz"; custom title prop overrides it.
 * - Selecting the CORRECT answer:
 *     · Calls onAnswered(true, 5) — SM-2 quality 5.
 *     · All option buttons become disabled.
 *     · Feedback changes to "Great recall!" success message.
 *     · Explanation text is rendered.
 * - Selecting an INCORRECT answer:
 *     · Calls onAnswered(false, 2) — SM-2 quality 2.
 *     · All option buttons become disabled.
 *     · Feedback shows "Not quite yet." error message.
 *     · Explanation text is rendered.
 * - Idempotency: clicking a second time after selection is a no-op
 *   (onAnswered called exactly once).
 * - Explanation fallback: if question.explanation is undefined, uses
 *   'The correct answer is "{answer}".' text.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizSimple } from "@/components/game/QuizSimple";
import type { GameQuestion } from "@/components/game/GameEngine";

// ─── Shared fixtures ─────────────────────────────────────────────────────────

const CORRECT_ANSWER = "A JavaScript library for building UIs";

const baseQuestion: GameQuestion = {
  id: "q1",
  question: "What is React?",
  answer: CORRECT_ANSWER,
  options: [
    CORRECT_ANSWER,
    "A CSS framework",
    "A database ORM",
    "A backend runtime",
  ],
  category: "React",
  type: "QUIZ_SIMPLE",
  level: "Beginner",
  explanation: "React is a declarative, component-based JS library.",
};

describe("QuizSimple", () => {
  // ─── Initial render ───────────────────────────────────────────────────────

  it("renders the question text", () => {
    // Arrange & Act
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Assert
    expect(screen.getByText("What is React?")).toBeInTheDocument();
  });

  it("renders all answer options as buttons", () => {
    // Arrange & Act
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Assert — each option should be a clickable button
    baseQuestion.options.forEach((opt) => {
      expect(screen.getByRole("button", { name: opt })).toBeInTheDocument();
    });
  });

  it('renders the default "Quick Quiz" title', () => {
    // Arrange & Act
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Assert
    expect(screen.getByText("Quick Quiz")).toBeInTheDocument();
  });

  it("renders a custom title when the title prop is provided", () => {
    // Arrange & Act
    render(
      <QuizSimple
        question={baseQuestion}
        onAnswered={vi.fn()}
        title="Fill in the blank"
      />,
    );
    // Assert
    expect(screen.getByText("Fill in the blank")).toBeInTheDocument();
    expect(screen.queryByText("Quick Quiz")).not.toBeInTheDocument();
  });

  it("renders the category in the card header", () => {
    // Arrange & Act
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Assert — the category renders as "◉ React" inside a .mono span;
    // using the ◉ prefix avoids matching the question text "What is React?"
    expect(screen.getByText(/◉/)).toBeInTheDocument();
  });

  it("renders the level badge", () => {
    // Arrange & Act
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Assert — Badge contains the level
    expect(screen.getByText("Beginner")).toBeInTheDocument();
  });

  it("shows the initial recall prompt before any selection", () => {
    // Arrange & Act
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Assert
    expect(
      screen.getByText("Choose one option to test your recall."),
    ).toBeInTheDocument();
  });

  it("does NOT show explanation before any selection", () => {
    // Arrange & Act
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Assert
    expect(
      screen.queryByText(baseQuestion.explanation!),
    ).not.toBeInTheDocument();
  });

  // ─── Correct answer selection ─────────────────────────────────────────────

  it("calls onAnswered(true, 5) when the correct answer is selected", async () => {
    // Arrange
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    render(<QuizSimple question={baseQuestion} onAnswered={onAnswered} />);
    // Act
    await user.click(screen.getByRole("button", { name: CORRECT_ANSWER }));
    // Assert
    expect(onAnswered).toHaveBeenCalledOnce();
    expect(onAnswered).toHaveBeenCalledWith(true, 5);
  });

  it('shows "Great recall!" feedback after selecting the correct answer', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: CORRECT_ANSWER }));
    // Assert
    expect(
      screen.getByText("Great recall! Keep the streak going."),
    ).toBeInTheDocument();
  });

  it("disables all option buttons after selecting the correct answer", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: CORRECT_ANSWER }));
    // Assert — every option button is disabled
    baseQuestion.options.forEach((opt) => {
      expect(screen.getByRole("button", { name: opt })).toBeDisabled();
    });
  });

  it("shows the explanation text after a correct selection", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: CORRECT_ANSWER }));
    // Assert
    expect(screen.getByText(baseQuestion.explanation!)).toBeInTheDocument();
  });

  // ─── Incorrect answer selection ───────────────────────────────────────────

  it("calls onAnswered(false, 2) when an incorrect answer is selected", async () => {
    // Arrange
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    render(<QuizSimple question={baseQuestion} onAnswered={onAnswered} />);
    // Act
    await user.click(screen.getByRole("button", { name: "A CSS framework" }));
    // Assert
    expect(onAnswered).toHaveBeenCalledOnce();
    expect(onAnswered).toHaveBeenCalledWith(false, 2);
  });

  it('shows "Not quite yet." feedback after an incorrect selection', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: "A CSS framework" }));
    // Assert
    expect(
      screen.getByText(
        "Not quite yet. Review the explanation and try again in the next round.",
      ),
    ).toBeInTheDocument();
  });

  it("disables all option buttons after an incorrect selection", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: "A database ORM" }));
    // Assert
    baseQuestion.options.forEach((opt) => {
      expect(screen.getByRole("button", { name: opt })).toBeDisabled();
    });
  });

  it("shows the explanation after an incorrect selection", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<QuizSimple question={baseQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: "A CSS framework" }));
    // Assert
    expect(screen.getByText(baseQuestion.explanation!)).toBeInTheDocument();
  });

  // ─── Idempotency (no double-answer) ───────────────────────────────────────

  it("ignores second clicks after an answer has been selected", async () => {
    // Arrange
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    render(<QuizSimple question={baseQuestion} onAnswered={onAnswered} />);
    // Act — first click selects; second click (via keyboard space on disabled btn)
    //       should be blocked because buttons are disabled
    await user.click(screen.getByRole("button", { name: CORRECT_ANSWER }));
    await user.click(screen.getByRole("button", { name: CORRECT_ANSWER }));
    // Assert — onAnswered called only once
    expect(onAnswered).toHaveBeenCalledOnce();
  });

  // ─── Explanation fallback ─────────────────────────────────────────────────

  it('falls back to "The correct answer is …" when explanation is undefined', async () => {
    // Arrange
    const user = userEvent.setup();
    const noExplanation: GameQuestion = {
      ...baseQuestion,
      explanation: undefined,
    };
    render(<QuizSimple question={noExplanation} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: "A CSS framework" }));
    // Assert — fallback text
    expect(
      screen.getByText(`The correct answer is "${CORRECT_ANSWER}".`),
    ).toBeInTheDocument();
  });
});
