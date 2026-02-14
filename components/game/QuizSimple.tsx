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
    if (!isAnswered) return "Choose one option to test your recall.";
    if (isCorrect) return "Great recall! Keep the streak going.";
    return "Not quite yet. Review the explanation and try again in the next round.";
  }, [isAnswered, isCorrect]);

  const handleSelection = (option: string) => {
    if (isAnswered) return;
    const correct = option === question.answer;
    setSelectedOption(option);
    onAnswered(correct, correct ? 5 : 2);
  };

  return (
    <Card style={{ maxWidth: 760, margin: '0 auto' }}>
      <CardHeader>
        <div className="header-row">
          <CardTitle>{title}</CardTitle>
          <Badge>{question.level}</Badge>
        </div>
        <div className="text-muted" style={{ display: 'flex', gap: '.55rem', alignItems: 'center', fontSize: '.8rem' }}>
          <span className="mono">◉ {question.category}</span>
          {question.technologyIcon}
        </div>
        <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.45 }}>{question.question}</p>
      </CardHeader>
      <CardContent style={{ display: 'grid', gap: '.65rem' }}>
        {question.options.map((option) => {
          const showCorrect = isAnswered && option === question.answer;
          const showIncorrect = isAnswered && option === selectedOption && option !== question.answer;

          return (
            <Button
              key={option}
              type="button"
              variant={showCorrect ? "default" : showIncorrect ? "destructive" : "outline"}
              className="ui-button-block"
              style={{ height: 'auto', textAlign: 'left', justifyContent: 'flex-start', padding: '.8rem 1rem' }}
              onClick={() => handleSelection(option)}
              disabled={isAnswered}
            >
              {option}
            </Button>
          );
        })}

        <div className={`feedback ${isCorrect && isAnswered ? 'feedback-success' : ''}`.trim()}>
          <p style={{ margin: 0, fontWeight: 600 }}>{feedbackText}</p>
          {isAnswered ? (
            <p className="text-muted" style={{ marginBottom: 0 }}>
              Explanation: {question.explanation ?? `The correct answer is "${question.answer}".`}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
