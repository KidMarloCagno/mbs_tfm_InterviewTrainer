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

  useEffect(() => {
    if (!categoryName) return;
    setLoading(true);
    resetSession();
    const topicQuestions = getQuestionsByTopic(categoryName);
    startSession(topicQuestions);
    setLoading(false);
  }, [categoryName, resetSession, startSession]);

  if (loading) {
    return <div className="app-shell container mono">Loading question set...</div>;
  }

  if (sessionQuestions.length === 0) {
    return (
      <div className="app-shell" style={{ display: 'grid', placeItems: 'center' }}>
        <Card style={{ maxWidth: 500 }}>
          <CardHeader><CardTitle>No questions available</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted">There are no questions for {categoryName} yet.</p>
            <Button onClick={() => router.push('/')} className="ui-button-block">Back to Topics</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / sessionQuestions.length) * 100);
    return (
      <div className="app-shell" style={{ display: 'grid', placeItems: 'center' }}>
        <Card style={{ maxWidth: 500 }}>
          <CardHeader><CardTitle className="mono">Session Complete · Tier Progress Updated</CardTitle></CardHeader>
          <CardContent style={{ display: 'grid', gap: '.75rem' }}>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>{score}/{sessionQuestions.length}</p>
            <p className="text-muted" style={{ margin: 0 }}>Precision: {percentage}%</p>
            <Button className="ui-button-block" onClick={() => { resetSession(); router.push('/'); }}>Back to Topics</Button>
            <Button className="ui-button-block" variant="outline" onClick={() => { resetSession(); window.location.reload(); }}>Run Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / sessionQuestions.length) * 100;

  return (
    <div className="app-shell">
      <div className="container">
        <div className="glass-banner" style={{ marginBottom: '1rem' }}>
          <div className="header-row">
            <div>
              <h1 className="mono" style={{ margin: 0 }}>{categoryName}</h1>
              <p className="text-muted" style={{ margin: '.2rem 0 0' }}>Question {currentQuestionIndex + 1} / {sessionQuestions.length}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ color: 'var(--secondary)', fontSize: '1.35rem', fontWeight: 700 }}>⚡ Uptime {score}</div>
              <p className="text-muted" style={{ margin: '.2rem 0 0' }}>Correct answers</p>
            </div>
          </div>
          <div style={{ marginTop: '.8rem' }}><Progress value={progressPercent} /></div>
        </div>

        <div style={{ marginBottom: '1rem' }} key={currentQuestion.id}>
          <GameEngine
            question={currentQuestion}
            onAnswered={(isCorrect) => {
              setLastAnswerCorrect(isCorrect);
              answerQuestion(isCorrect);
              if (isCorrect) {
                setTimeout(() => {
                  if (currentQuestionIndex < sessionQuestions.length - 1) {
                    setLastAnswerCorrect(null);
                    nextQuestion();
                  }
                }, 4000);
              }
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '.75rem' }}>
          <Button onClick={() => router.push('/')} variant="outline" style={{ flex: 1 }}>Exit Session</Button>
          {currentQuestionIndex < sessionQuestions.length - 1 && lastAnswerCorrect === false ? (
            <Button onClick={() => { setLastAnswerCorrect(null); nextQuestion(); }} style={{ flex: 1 }}>Next Question →</Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
