"use client";

import { useState } from "react";
import type { GameQuestion } from "@/components/game/GameEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrueFalseProps {
  question: GameQuestion;
  onAnswered: (isCorrect: boolean, quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
}

export function TrueFalse({ question, onAnswered }: TrueFalseProps) {
  const [selected, setSelected] = useState<"True" | "False" | null>(null);
  const isAnswered = selected !== null;
  const isCorrect = selected === question.answer;

  const handleAnswer = (choice: "True" | "False") => {
    if (isAnswered) return;
    setSelected(choice);
    const correct = choice === question.answer;
    onAnswered(correct, correct ? 5 : 2);
  };

  return (
    <Card style={{ maxWidth: 700, margin: "0 auto" }}>
      <CardHeader>
        <CardTitle>True / False Sprint</CardTitle>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: "1.05rem", fontWeight: 600 }}>
          {question.question}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: ".65rem",
          }}
        >
          <Button onClick={() => handleAnswer("True")} disabled={isAnswered}>
            True
          </Button>
          <Button
            onClick={() => handleAnswer("False")}
            variant="outline"
            disabled={isAnswered}
          >
            False
          </Button>
        </div>
        {isAnswered ? (
          <div
            className={`feedback${isCorrect ? " feedback-success" : " feedback-wrong"}`}
            style={{ marginTop: ".75rem" }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>
              {isCorrect
                ? "Correct!"
                : `Incorrect — the answer is: ${question.answer}`}
            </p>
            {question.explanation ? (
              <p
                className={`feedback-explanation${!isCorrect ? " feedback-explanation-wrong" : ""}`}
              >
                {question.explanation}
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
