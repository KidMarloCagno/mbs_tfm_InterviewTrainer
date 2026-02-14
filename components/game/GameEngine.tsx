"use client";

import type { ReactNode } from "react";
import { QuizSimple } from "@/components/game/QuizSimple";
import { TrueFalse } from "@/components/game/TrueFalse";

export type GameQuestionType = "QUIZ_SIMPLE" | "FILL_THE_BLANK" | "TRUE_FALSE";

export interface GameQuestion {
  id: string;
  question: string;
  answer: string;
  options: string[];
  category: string;
  type: GameQuestionType;
  level: "Beginner" | "Intermediate" | "Advanced";
  explanation?: string;
  technologyIcon?: ReactNode;
}

interface GameEngineProps {
  question: GameQuestion;
  onAnswered: (isCorrect: boolean, quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
}

export function GameEngine({ question, onAnswered }: GameEngineProps) {
  switch (question.type) {
    case "QUIZ_SIMPLE":
      return <QuizSimple question={question} onAnswered={onAnswered} />;
    case "TRUE_FALSE":
      return <TrueFalse question={question} onAnswered={onAnswered} />;
    case "FILL_THE_BLANK":
      return (
        <QuizSimple
          question={question}
          onAnswered={onAnswered}
          title="Fill in the blank"
        />
      );
    default:
      return (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Unsupported question type.
        </div>
      );
  }
}
