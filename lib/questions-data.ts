import databaseQuestions from '@/prisma/data/sets/database.json';
import javascriptQuestions from '@/prisma/data/sets/javascript.json';
import type { GameQuestion } from '@/components/game/GameEngine';

interface QuestionSetItem {
  id?: string;
  question: string;
  answer: string;
  options: string[];
  type: GameQuestion['type'];
  level: GameQuestion['level'];
}

const questionsData: Record<string, GameQuestion[]> = {
  Database: (databaseQuestions as QuestionSetItem[]).map((q, idx) => ({
    id: `db-${idx}`,
    question: q.question,
    answer: q.answer,
    options: q.options,
    category: 'Database',
    type: q.type,
    level: q.level,
  })),
  JavaScript: (javascriptQuestions as QuestionSetItem[]).map((q, idx) => ({
    id: q.id || `js-${idx}`,
    question: q.question,
    answer: q.answer,
    options: q.options,
    category: 'JavaScript',
    type: q.type,
    level: q.level,
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
