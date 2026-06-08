import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/store/useGameStore";
import type { GameQuestion } from "@/components/game/GameEngine";

function makeQuestion(index: number): GameQuestion {
  return {
    id: `js-q${String(index).padStart(3, "0")}`,
    question: `Question ${index}`,
    answer: "Correct",
    options: ["Correct", "Wrong A", "Wrong B", "Wrong C"],
    category: `Category ${index % 3}`,
    type: "QUIZ_SIMPLE",
    level: "Beginner",
  };
}

describe("useGameStore", () => {
  beforeEach(() => {
    useGameStore.getState().resetSession();
  });

  it("starts a session with every question returned by the API", () => {
    const questions = Array.from({ length: 30 }, (_, index) =>
      makeQuestion(index + 1),
    );

    useGameStore.getState().startSession(questions);

    const sessionQuestions = useGameStore.getState().sessionQuestions;
    expect(sessionQuestions).toHaveLength(30);
    expect(new Set(sessionQuestions.map((q) => q.id))).toEqual(
      new Set(questions.map((q) => q.id)),
    );
  });
});
