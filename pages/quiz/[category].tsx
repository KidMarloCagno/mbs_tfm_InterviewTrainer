import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GameEngine } from '@/components/game/GameEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getQuestionsByTopic } from '@/lib/questions-data';
import { useGameStore } from '@/store/useGameStore';

export default function QuizPage() {
  const router = useRouter();
  const { category } = router.query;
  const categoryName = typeof category === 'string' ? decodeURIComponent(category) : '';

  const [loading, setLoading] = useState(true);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const {
    sessionQuestions,
    currentQuestionIndex,
    score,
    isFinished,
    startSession,
    answerQuestion,
    nextQuestion,
    resetSession,
  } = useGameStore();

  // Load questions
  useEffect(() => {
    if (!categoryName) return;
    
    setLoading(true);
    resetSession(); // Reset old session first
    const topicQuestions = getQuestionsByTopic(categoryName);
    startSession(topicQuestions); // Always start fresh session for new category
    setLoading(false);
  }, [categoryName, startSession, resetSession]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500"></div>
          <p className="text-slate-300">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (sessionQuestions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No questions available</CardTitle>
          </CardHeader>
          <CardContent>Name
            <p className="mb-4 text-slate-600">
              There are no questions for the {category} topic yet.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Complete! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-green-500">
                {score}/{sessionQuestions.length}
              </div>
              <p className="text-lg font-medium text-slate-700">
                You scored {percentage}%
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  resetSession();
                  router.push('/');
                }}
                className="w-full"
              >
                Back to Topics
              </Button>
              <Button
                onClick={() => {
                  resetSession();
                  window.location.reload();
                }}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / sessionQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">Name
            <div>
              <h1 className="text-2xl font-bold text-white">{category}</h1>
              <p className="text-sm text-slate-400">
                Question {currentQuestionIndex + 1} of {sessionQuestions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">{score}</div>
              <p className="text-sm text-slate-400">Correct</p>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question Component */}
        <div className="mb-8" key={currentQuestion.id}>
          <GameEngine
            question={currentQuestion}
            onAnswered={(isCorrect) => {
              setLastAnswerCorrect(isCorrect);
              answerQuestion(isCorrect);
              
              // Auto-advance only if answer is correct
              if (isCorrect) {
                setTimeout(() => {
                  if (currentQuestionIndex < sessionQuestions.length - 1) {
                    setLastAnswerCorrect(null);
                    nextQuestion();
                  }
                }, 3500);
              }
            }}
          />
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex-1"
          >
            Exit Quiz
          </Button>
          {currentQuestionIndex < sessionQuestions.length - 1 && lastAnswerCorrect === false && (
            <Button
              onClick={() => {
                setLastAnswerCorrect(null);
                nextQuestion();
              }}
              className="flex-1"
            >
              Next Question →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
