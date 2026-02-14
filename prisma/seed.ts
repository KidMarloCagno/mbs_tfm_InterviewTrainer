import { PrismaClient, DifficultyLevel, QuestionType } from "@prisma/client";
import { promises as fs } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

interface QuestionSetItem {
  id: string;
  question: string;
  answer: string;
  options: string[];
  category: string;
  type: "QUIZ_SIMPLE" | "FILL_THE_BLANK" | "TRUE_FALSE";
  level: "Beginner" | "Intermediate" | "Advanced";
}

const DATA_DIR = path.join(process.cwd(), "prisma", "data", "sets");

async function readQuestionFiles(): Promise<QuestionSetItem[]> {
  const files = await fs.readdir(DATA_DIR);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  const allItems = await Promise.all(
    jsonFiles.map(async (fileName) => {
      const fullPath = path.join(DATA_DIR, fileName);
      const raw = await fs.readFile(fullPath, "utf8");
      const parsed = JSON.parse(raw) as QuestionSetItem[];
      return parsed;
    }),
  );

  return allItems.flat();
}

async function main() {
  const items = await readQuestionFiles();

  for (const item of items) {
    await prisma.question.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        question: item.question,
        answer: item.answer,
        options: item.options,
        category: item.category,
        type: item.type as QuestionType,
        level: item.level as DifficultyLevel,
      },
      update: {
        question: item.question,
        answer: item.answer,
        options: item.options,
        category: item.category,
        type: item.type as QuestionType,
        level: item.level as DifficultyLevel,
      },
    });
  }

  console.log(`Seeded ${items.length} questions from ${DATA_DIR}`);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
