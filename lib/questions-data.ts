import angularQuestions from "@/prisma/data/sets/angular.json";
import backendQuestions from "@/prisma/data/sets/backend.json";
import databaseQuestions from "@/prisma/data/sets/database.json";
import djangoQuestions from "@/prisma/data/sets/django.json";
import frontendQuestions from "@/prisma/data/sets/frontend.json";
import javaQuestions from "@/prisma/data/sets/java.json";
import javascriptQuestions from "@/prisma/data/sets/javascript.json";
import pythonQuestions from "@/prisma/data/sets/python.json";
import reactQuestions from "@/prisma/data/sets/react.json";
import springQuestions from "@/prisma/data/sets/spring.json";
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

function mapSet(
  items: QuestionSetItem[],
  category: string,
  prefix: string,
): GameQuestion[] {
  return (items as QuestionSetItem[]).map((q, idx) => ({
    id: q.id || `${prefix}-${idx}`,
    question: q.question,
    answer: q.answer,
    options: q.options,
    category,
    type: q.type,
    level: q.level,
    explanation: q.explanation,
  }));
}

const questionsData: Record<string, GameQuestion[]> = {
  Angular: mapSet(angularQuestions as QuestionSetItem[], "Angular", "ang"),
  Backend: mapSet(backendQuestions as QuestionSetItem[], "Backend", "be"),
  Database: mapSet(databaseQuestions as QuestionSetItem[], "Database", "db"),
  Django: mapSet(djangoQuestions as QuestionSetItem[], "Django", "dj"),
  Frontend: mapSet(frontendQuestions as QuestionSetItem[], "Frontend", "fe"),
  Java: mapSet(javaQuestions as QuestionSetItem[], "Java", "jv"),
  JavaScript: mapSet(
    javascriptQuestions as QuestionSetItem[],
    "JavaScript",
    "js",
  ),
  Python: mapSet(pythonQuestions as QuestionSetItem[], "Python", "py"),
  React: mapSet(reactQuestions as QuestionSetItem[], "React", "re"),
  Spring: mapSet(springQuestions as QuestionSetItem[], "Spring", "sp"),
  SystemsDesign: mapSet(
    systemdesignQuestions as QuestionSetItem[],
    "System Design",
    "sd",
  ),
};

export function getAvailableTopics(): string[] {
  return Object.keys(questionsData).sort((a, b) => a.localeCompare(b));
}

export function getQuestionsByTopic(topic: string): GameQuestion[] {
  return questionsData[topic] || [];
}

export function getAllQuestions(): GameQuestion[] {
  return Object.values(questionsData).flat();
}
