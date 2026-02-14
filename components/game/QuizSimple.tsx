"use client";

import { useMemo, useState } from "react";
import type { GameQuestion } from "@/components/game/GameEngine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizSimpleProps {
  question: GameQuestion;
  onAnswered: (isCorrect: boolean, quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
  title?: string;
}

export function QuizSimple({ question, onAnswered, title = "Quick Quiz" }: QuizSimpleProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === question.answer;

  const feedbackText = useMemo(() => {
    if (!isAnswered) {
      return "Choose one option to test your recall.";
    }

    if (isCorrect) {
      return "Great recall! Keep the streak going.";
    }

    return "Not quite yet. Review the explanation and try again in the next round.";
  }, [isAnswered, isCorrect]);

  const handleSelection = (option: string) => {
    if (isAnswered) {
      return;
    }

    const correct = option === question.answer;
    setSelectedOption(option);
    onAnswered(correct, correct ? 5 : 2);
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge variant="secondary">{question.level}</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border">◎</span>
          <span>Tech icon placeholder</span>
          {question.technologyIcon}
        </div>
        <p className="text-base font-medium leading-relaxed">{question.question}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {question.options.map((option) => {
          const showCorrect = isAnswered && option === question.answer;
          const showIncorrect = isAnswered && option === selectedOption && option !== question.answer;

          return (
            <Button
              key={option}
              type="button"
              variant={showCorrect ? "default" : showIncorrect ? "destructive" : "outline"}
              className="h-auto w-full justify-start whitespace-normal px-4 py-3 text-left"
              onClick={() => handleSelection(option)}
              disabled={isAnswered}
            >
              {option}
            </Button>
          );
        })}

        <div
          className={`rounded-md border p-3 text-sm ${
            isCorrect && isAnswered ? "border-emerald-500/30 bg-emerald-500/10" : "border-muted"
          }`}
        >
          <p className="font-medium">{feedbackText}</p>
          {isAnswered ? (
            <p className="mt-1 text-muted-foreground">
              Explanation: {question.explanation ?? `The correct answer is "${question.answer}".`}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
