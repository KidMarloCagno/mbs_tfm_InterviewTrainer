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
    if (isAnswered) return;
    setSelected(choice);
    const isCorrect = choice === question.answer;
    onAnswered(isCorrect, isCorrect ? 5 : 2);
  };

  return (
    <Card style={{ maxWidth: 700, margin: '0 auto' }}>
      <CardHeader>
        <CardTitle>True / False Sprint</CardTitle>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>{question.question}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem' }}>
          <Button onClick={() => handleAnswer("Verdadero")} disabled={isAnswered}>Verdadero</Button>
          <Button onClick={() => handleAnswer("Falso")} variant="outline" disabled={isAnswered}>Falso</Button>
        </div>
        {isAnswered ? <p className="text-muted">Respuesta correcta: {question.answer}</p> : null}
      </CardContent>
    </Card>
  );
}
