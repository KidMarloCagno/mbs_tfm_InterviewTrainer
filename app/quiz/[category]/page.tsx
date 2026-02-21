"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GameEngine } from "@/components/game/GameEngine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGameStore } from "@/store/useGameStore";
import type { GameQuestion } from "@/components/game/GameEngine";

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawCategory =
    typeof params?.category === "string" ? params.category : "";
  const categoryName = useMemo(
    () => (rawCategory ? decodeURIComponent(rawCategory) : ""),
    [rawCategory],
  );

  // Session config from modal (forwarded as query params)
  const count = searchParams?.get("count") ?? "10";
  const type = searchParams?.get("type") ?? "mixed";

  const [loading, setLoading] = useState(true);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null,
  );

  const {
    sessionQuestions,
    currentQuestionIndex,
    score,
    isFinished,
    answeredResults,
    startSession,
    answerQuestion,
    nextQuestion,
    resetSession,
  } = useGameStore();

  // Load questions from the SM-2 ordered API endpoint with user-selected config
  useEffect(() => {
    if (!categoryName) return;
    setLoading(true);
    resetSession();
    const qs = new URLSearchParams({ count, type });
    fetch(
      `/api/quiz/questions/${encodeURIComponent(categoryName)}?${qs.toString()}`,
    )
      .then((res) => res.json())
      .then((data: { questions?: GameQuestion[] }) => {
        startSession(data.questions ?? []);
      })
      .catch(() => {
        startSession([]);
      })
      .finally(() => setLoading(false));
  }, [categoryName, count, type, resetSession, startSession]);

  // Persist session results to the DB via SM-2 once the session is done
  useEffect(() => {
    if (!isFinished || answeredResults.length === 0) return;
    fetch("/api/quiz/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: answeredResults }),
    }).catch(() => {
      // Best-effort — ignore network failures silently
    });
  }, [isFinished, answeredResults]);

  if (loading) {
    return (
      <div className="app-shell container mono">Loading question set...</div>
    );
  }

  if (sessionQuestions.length === 0) {
    return (
      <div
        className="app-shell"
        style={{ display: "grid", placeItems: "center" }}
      >
        <Card style={{ maxWidth: 500 }}>
          <CardHeader>
            <CardTitle>No questions available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted">
              There are no questions for {categoryName} with the selected
              filters.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="ui-button-block"
            >
              Back to Topics
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / sessionQuestions.length) * 100);
    return (
      <div
        className="app-shell"
        style={{ display: "grid", placeItems: "center" }}
      >
        <Card style={{ maxWidth: 500 }}>
          <CardHeader>
            <CardTitle className="mono">
              Session Complete · Tier Progress Updated
            </CardTitle>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: ".75rem" }}>
            <p
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--secondary)",
              }}
            >
              {score}/{sessionQuestions.length}
            </p>
            <p className="text-muted" style={{ margin: 0 }}>
              Precision: {percentage}%
            </p>
            <p className="text-muted" style={{ margin: 0, fontSize: ".85rem" }}>
              Progress saved · Questions scheduled for spaced repetition review
            </p>
            <Button
              className="ui-button-block"
              onClick={() => {
                resetSession();
                router.push("/dashboard");
              }}
            >
              Back to Topics
            </Button>
            <Button
              className="ui-button-block"
              variant="outline"
              onClick={() => {
                resetSession();
                window.location.reload();
              }}
            >
              Run Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const progressPercent =
    ((currentQuestionIndex + 1) / sessionQuestions.length) * 100;

  return (
    <div className="app-shell">
      <div className="container">
        <div className="glass-banner" style={{ marginBottom: "1rem" }}>
          <div className="header-row">
            <div>
              <h1 className="mono" style={{ margin: 0 }}>
                {categoryName}
              </h1>
              <p className="text-muted" style={{ margin: ".2rem 0 0" }}>
                Question {currentQuestionIndex + 1} / {sessionQuestions.length}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                className="mono"
                style={{
                  color: "var(--secondary)",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                }}
              >
                ⚡ Uptime {score}
              </div>
              <p className="text-muted" style={{ margin: ".2rem 0 0" }}>
                Correct answers
              </p>
            </div>
          </div>
          <div style={{ marginTop: ".8rem" }}>
            <Progress value={progressPercent} />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }} key={currentQuestion.id}>
          <GameEngine
            question={currentQuestion}
            onAnswered={(isCorrect, quality) => {
              setLastAnswerCorrect(isCorrect);
              answerQuestion(currentQuestion.id, isCorrect, quality);
              if (isCorrect) {
                setTimeout(() => {
                  setLastAnswerCorrect(null);
                  nextQuestion();
                }, 4000);
              }
            }}
          />
        </div>

        <div style={{ display: "flex", gap: ".75rem" }}>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            style={{ flex: 1 }}
          >
            Exit Session
          </Button>
          {lastAnswerCorrect === false ? (
            <Button
              onClick={() => {
                setLastAnswerCorrect(null);
                nextQuestion();
              }}
              style={{ flex: 1 }}
            >
              Next Question {"->"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
