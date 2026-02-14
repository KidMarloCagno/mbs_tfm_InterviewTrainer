import databaseQuestions from '@/prisma/data/sets/database.json';
import javascriptQuestions from '@/prisma/data/sets/javascript.json';
import type { GameQuestion } from '@/components/game/GameEngine';

const questionsData: Record<string, GameQuestion[]> = {
  Database: databaseQuestions.map((q, idx) => ({
    id: `db-${idx}`,
    question: q.question,
    answer: q.answer,
    options: q.options,
    category: 'Database',
    type: q.type as 'QUIZ_SIMPLE' | 'TRUE_FALSE' | 'FILL_THE_BLANK',
    level: q.level as 'Beginner' | 'Intermediate' | 'Advanced',
    explanation: q.explanation,
  })),
  JavaScript: javascriptQuestions.map((q, idx) => ({
    id: q.id || `js-${idx}`,
    question: q.question,
    answer: q.answer,
    options: q.options,
    category: 'JavaScript',
    type: q.type as 'QUIZ_SIMPLE' | 'TRUE_FALSE' | 'FILL_THE_BLANK',
    level: q.level as 'Beginner' | 'Intermediate' | 'Advanced',
    explanation: q.explanation,
  })),
};

export function getAvailableTopics(): string[] {
  return Object.keys(questionsData).sort();
}

export function getQuestionsByTopic(topic: string): GameQuestion[] {
  return questionsData[topic] || [];
}

export function getAllQuestions(): GameQuestion[] {
  return Object.values(questionsData).flat();
}
