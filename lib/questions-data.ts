import angularQuestions from "@/prisma/data/sets/angular.json";
import backendQuestions from "@/prisma/data/sets/backend.json";
import databaseQuestions from "@/prisma/data/sets/database.json";
import designPatternsQuestions from "@/prisma/data/sets/designPatterns.json";
import djangoQuestions from "@/prisma/data/sets/django.json";
import frontendQuestions from "@/prisma/data/sets/frontend.json";
import gitBasicsQuestions from "@/prisma/data/sets/gitBasics.json";
import ciCdBasicsQuestions from "@/prisma/data/sets/ciCdBasics.json";
import devOpsBasicsQuestions from "@/prisma/data/sets/devOpsBasics.json";
import springBootBasicsQuestions from "@/prisma/data/sets/springBootBasics.json";
import javaQuestions from "@/prisma/data/sets/java.json";
import jiJavaQuestions from "@/prisma/data/sets/jiJava.json";
import javascriptQuestions from "@/prisma/data/sets/javascript.json";
import kafkaBasicsQuestions from "@/prisma/data/sets/kafkaBasics.json";
import mavenBasicsQuestions from "@/prisma/data/sets/mavenBasics.json";
import pythonQuestions from "@/prisma/data/sets/python.json";
import reactQuestions from "@/prisma/data/sets/react.json";
import springQuestions from "@/prisma/data/sets/spring.json";
import systemdesignQuestions from "@/prisma/data/sets/systemsdesign.json";
import bs00Fundamentos from "@/prisma/data/sets/BS_00_Fundamentos_Desarollo.json";
import bs00Intro from "@/prisma/data/sets/BS_00_Intro.json";
import bs01IngSoftware from "@/prisma/data/sets/BS_01_Ing_Software.json";
import bs02ArqSoftware from "@/prisma/data/sets/BS_02_Arq_Software.json";
import javaKeyConcepts from "@/prisma/data/sets/java_key_concepts.json";
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
  return items.map((q, idx) => ({
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
  "JI Java": mapSet(jiJavaQuestions as QuestionSetItem[], "JI Java", "java"),
  JavaScript: mapSet(
    javascriptQuestions as QuestionSetItem[],
    "JavaScript",
    "js",
  ),
  Python: mapSet(pythonQuestions as QuestionSetItem[], "Python", "py"),
  React: mapSet(reactQuestions as QuestionSetItem[], "React", "re"),
  Spring: mapSet(springQuestions as QuestionSetItem[], "Spring", "sp"),
  "Design Patterns": mapSet(
    designPatternsQuestions as QuestionSetItem[],
    "Design Patterns",
    "dp",
  ),
  "BS 00 Intro": mapSet(bs00Intro as QuestionSetItem[], "BS 00 Intro", "bs0i"),
  "BS 00 Fundamentos Desarollo": mapSet(
    bs00Fundamentos as QuestionSetItem[],
    "BS 00 Fundamentos Desarollo",
    "bs0f",
  ),
  "BS 01 Ing Software": mapSet(
    bs01IngSoftware as QuestionSetItem[],
    "BS 01 Ing Software",
    "bs1",
  ),
  "BS 02 Arq Software": mapSet(
    bs02ArqSoftware as QuestionSetItem[],
    "BS 02 Arq Software",
    "bs2",
  ),
  "CI/CD Basics": mapSet(
    ciCdBasicsQuestions as QuestionSetItem[],
    "CI/CD Basics",
    "ci",
  ),
  "DevOps Basics": mapSet(
    devOpsBasicsQuestions as QuestionSetItem[],
    "DevOps Basics",
    "do",
  ),
  "Spring Boot Basics": mapSet(
    springBootBasicsQuestions as QuestionSetItem[],
    "Spring Boot Basics",
    "sb",
  ),
  "Git Basics": mapSet(
    gitBasicsQuestions as QuestionSetItem[],
    "Git Basics",
    "gb",
  ),
  "Kafka Basics": mapSet(
    kafkaBasicsQuestions as QuestionSetItem[],
    "Kafka Basics",
    "kf",
  ),
  "Maven Basics": mapSet(
    mavenBasicsQuestions as QuestionSetItem[],
    "Maven Basics",
    "mvn",
  ),
  "Java Key Concepts": mapSet(
    javaKeyConcepts as QuestionSetItem[],
    "Java Key Concepts",
    "jkc",
  ),
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
