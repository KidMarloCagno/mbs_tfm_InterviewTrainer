/**
 * TrueFalse component tests — IMPORTANT TIER (core game loop)
 *
 * Strategy:
 * - Render initial state: heading "True / False Sprint", question text, True/False buttons.
 * - Selecting the CORRECT answer (matches question.answer):
 *     · onAnswered(true, 5) is called.
 *     · "Correct!" feedback is shown.
 *     · Both buttons become disabled.
 *     · Explanation rendered (if provided).
 * - Selecting the INCORRECT answer:
 *     · onAnswered(false, 2) is called.
 *     · Feedback shows "Incorrect — the answer is: {answer}".
 *     · Both buttons become disabled.
 * - Idempotency: no second call to onAnswered after buttons are disabled.
 * - No explanation text rendered before any selection.
 * - When explanation is absent, no explanation paragraph rendered after selection.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrueFalse } from "@/components/game/TrueFalse";
import type { GameQuestion } from "@/components/game/GameEngine";

// ─── Shared fixtures ─────────────────────────────────────────────────────────

const trueQuestion: GameQuestion = {
  id: "tf-1",
  question: "React is developed by Meta (Facebook).",
  answer: "True",
  options: ["True", "False"],
  category: "React",
  type: "TRUE_FALSE",
  level: "Beginner",
  explanation: "React was created at Facebook and is maintained by Meta.",
};

const falseQuestion: GameQuestion = {
  id: "tf-2",
  question: "HTTP is a stateful protocol.",
  answer: "False",
  options: ["True", "False"],
  category: "Networking",
  type: "TRUE_FALSE",
  level: "Intermediate",
  explanation:
    "HTTP is stateless by design; state is managed via cookies/sessions.",
};

describe("TrueFalse", () => {
  // ─── Initial render ───────────────────────────────────────────────────────

  it('renders the "True / False Sprint" heading', () => {
    // Arrange & Act
    render(<TrueFalse question={trueQuestion} onAnswered={vi.fn()} />);
    // Assert
    expect(screen.getByText("True / False Sprint")).toBeInTheDocument();
  });

  it("renders the question text", () => {
    // Arrange & Act
    render(<TrueFalse question={trueQuestion} onAnswered={vi.fn()} />);
    // Assert
    expect(
      screen.getByText("React is developed by Meta (Facebook)."),
    ).toBeInTheDocument();
  });

  it("renders the True and False buttons", () => {
    // Arrange & Act
    render(<TrueFalse question={trueQuestion} onAnswered={vi.fn()} />);
    // Assert
    expect(screen.getByRole("button", { name: "True" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "False" })).toBeInTheDocument();
  });

  it("buttons are enabled before any selection", () => {
    // Arrange & Act
    render(<TrueFalse question={trueQuestion} onAnswered={vi.fn()} />);
    // Assert
    expect(screen.getByRole("button", { name: "True" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "False" })).not.toBeDisabled();
  });

  it("does NOT show feedback before any selection", () => {
    // Arrange & Act
    render(<TrueFalse question={trueQuestion} onAnswered={vi.fn()} />);
    // Assert
    expect(screen.queryByText("Correct!")).not.toBeInTheDocument();
    expect(screen.queryByText(/Incorrect/)).not.toBeInTheDocument();
  });

  // ─── Correct answer (question.answer = "True") ────────────────────────────

  it("calls onAnswered(true, 5) when the correct answer is selected", async () => {
    // Arrange
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    render(<TrueFalse question={trueQuestion} onAnswered={onAnswered} />);
    // Act
    await user.click(screen.getByRole("button", { name: "True" }));
    // Assert
    expect(onAnswered).toHaveBeenCalledOnce();
    expect(onAnswered).toHaveBeenCalledWith(true, 5);
  });

  it('shows "Correct!" after selecting the right answer', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TrueFalse question={trueQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: "True" }));
    // Assert
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  it("disables both buttons after selecting the correct answer", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TrueFalse question={trueQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: "True" }));
    // Assert
    expect(screen.getByRole("button", { name: "True" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "False" })).toBeDisabled();
  });

  it("renders the explanation after a correct selection", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TrueFalse question={trueQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: "True" }));
    // Assert
    expect(screen.getByText(trueQuestion.explanation!)).toBeInTheDocument();
  });

  // ─── Incorrect answer (question.answer = "True", selecting "False") ───────

  it("calls onAnswered(false, 2) when an incorrect answer is selected", async () => {
    // Arrange
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    render(<TrueFalse question={trueQuestion} onAnswered={onAnswered} />);
    // Act
    await user.click(screen.getByRole("button", { name: "False" }));
    // Assert
    expect(onAnswered).toHaveBeenCalledOnce();
    expect(onAnswered).toHaveBeenCalledWith(false, 2);
  });

  it('shows "Incorrect — the answer is: True" after a wrong selection', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TrueFalse question={trueQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: "False" }));
    // Assert
    expect(
      screen.getByText("Incorrect — the answer is: True"),
    ).toBeInTheDocument();
  });

  it("disables both buttons after an incorrect selection", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TrueFalse question={trueQuestion} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: "False" }));
    // Assert
    expect(screen.getByRole("button", { name: "True" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "False" })).toBeDisabled();
  });

  // ─── Correct when answer is "False" ───────────────────────────────────────

  it('correctly identifies "False" as the right answer when question.answer = "False"', async () => {
    // Arrange
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    render(<TrueFalse question={falseQuestion} onAnswered={onAnswered} />);
    // Act
    await user.click(screen.getByRole("button", { name: "False" }));
    // Assert
    expect(onAnswered).toHaveBeenCalledWith(true, 5);
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  // ─── Idempotency ──────────────────────────────────────────────────────────

  it("ignores subsequent clicks after an answer is locked in", async () => {
    // Arrange
    const user = userEvent.setup();
    const onAnswered = vi.fn();
    render(<TrueFalse question={trueQuestion} onAnswered={onAnswered} />);
    // Act — first click selects; buttons are disabled, second click is a no-op
    await user.click(screen.getByRole("button", { name: "True" }));
    await user.click(screen.getByRole("button", { name: "True" }));
    // Assert
    expect(onAnswered).toHaveBeenCalledOnce();
  });

  // ─── No explanation ───────────────────────────────────────────────────────

  it("renders no explanation paragraph when explanation is undefined", async () => {
    // Arrange
    const user = userEvent.setup();
    const noExp: GameQuestion = { ...trueQuestion, explanation: undefined };
    render(<TrueFalse question={noExp} onAnswered={vi.fn()} />);
    // Act
    await user.click(screen.getByRole("button", { name: "True" }));
    // Assert — no extra paragraph beyond "Correct!"
    expect(
      screen.queryByText(trueQuestion.explanation!),
    ).not.toBeInTheDocument();
  });
});
