import databaseQuestions from "@/prisma/data/sets/database.json";
import javascriptQuestions from "@/prisma/data/sets/javascript.json";
import systemdesignQuestions from "@/prisma/data/sets/systemsdesign.json";
import type { GameQuestion } from "@/components/game/GameEngine";

interface QuestionSetItem {
  id: string;
  question: string;
  answer: string;
  options: string[];
  type: GameQuestion["type"];
  level: GameQuestion["level"];
  explanation?: string;
}

const questionsData: Record<string, GameQuestion[]> = {
  Database: (databaseQuestions as QuestionSetItem[]).map((q, idx) => ({
    id: q.id || `db-${idx}`,
    question: q.question,
    answer: q.answer,
    options: q.options,
    category: "Database",
    type: q.type,
    level: q.level,
    explanation: q.explanation,
  })),
  JavaScript: (javascriptQuestions as QuestionSetItem[]).map((q, idx) => ({
    id: q.id || `js-${idx}`,
    question: q.question,
    answer: q.answer,
    options: q.options,
    category: "JavaScript",
    type: q.type,
    level: q.level,
    explanation: q.explanation,
  })),
  SystemsDesign: (systemdesignQuestions as QuestionSetItem[]).map((q, idx) => ({
    id: q.id || `sd-${idx}`,
    question: q.question,
    answer: q.answer,
    options: q.options,
    category: "System Design",
    type: q.type,
    level: q.level,
    explanation: q.explanation,
  })),
};
// Vulnerable code for Snyk test
export function vulnerableEval(input: string) {
  // This is intentionally insecure for testing Snyk
  return eval(input);
}

export function getAvailableTopics(): string[] {
  return Object.keys(questionsData).sort((a, b) => a.localeCompare(b));
}

export function getQuestionsByTopic(topic: string): GameQuestion[] {
  return questionsData[topic] || [];
}

export function getAllQuestions(): GameQuestion[] {
  return Object.values(questionsData).flat();
}
