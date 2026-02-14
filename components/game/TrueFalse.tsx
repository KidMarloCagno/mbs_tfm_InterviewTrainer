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
  const [selected, setSelected] = useState<"Verdadero" | "Falso" | null>(null);

  const isAnswered = selected !== null;

  const handleAnswer = (choice: "Verdadero" | "Falso") => {
    if (isAnswered) {
      return;
    }

    setSelected(choice);
    const isCorrect = choice === question.answer;
    onAnswered(isCorrect, isCorrect ? 5 : 2);
  };

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>True / False Sprint</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium">{question.question}</p>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => handleAnswer("Verdadero")} disabled={isAnswered}>
            Verdadero
          </Button>
          <Button onClick={() => handleAnswer("Falso")} variant="outline" disabled={isAnswered}>
            Falso
          </Button>
        </div>
        {isAnswered ? (
          <p className="text-sm text-muted-foreground">Respuesta correcta: {question.answer}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
