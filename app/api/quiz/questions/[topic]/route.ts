import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getQuestionsByTopic } from "@/lib/questions-data";
import { prisma } from "@/lib/prisma";
import type {
  GameQuestion,
  GameQuestionType,
} from "@/components/game/GameEngine";

const VALID_TYPES = new Set<GameQuestionType>([
  "QUIZ_SIMPLE",
  "TRUE_FALSE",
  "FILL_THE_BLANK",
]);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { topic: string } },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const topic = decodeURIComponent(params.topic);

  // --- Query params: count and type filter ---
  const { searchParams } = new URL(request.url);
  const countParam = Number.parseInt(searchParams.get("count") ?? "10", 10);
  const count = Number.isNaN(countParam)
    ? 10
    : Math.min(20, Math.max(1, countParam));

  const typeParam = searchParams.get("type") ?? "mixed";
  const typeFilter: GameQuestionType | null = VALID_TYPES.has(
    typeParam as GameQuestionType,
  )
    ? (typeParam as GameQuestionType)
    : null;

  // --- Load and optionally filter by type ---
  const allQuestions = getQuestionsByTopic(topic);
  if (allQuestions.length === 0) {
    return NextResponse.json({ error: "Unknown topic." }, { status: 400 });
  }

  const pool: GameQuestion[] = typeFilter
    ? allQuestions.filter((q) => q.type === typeFilter)
    : allQuestions;

  if (pool.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  // --- SM-2 bucketing ---
  const questionIds = pool.map((q) => q.id);
  const progressRecords = await prisma.userProgress.findMany({
    where: { userId, questionId: { in: questionIds } },
    select: { questionId: true, nextReview: true },
  });

  const progressMap = new Map(progressRecords.map((p) => [p.questionId, p]));
  const now = new Date();

  const due: GameQuestion[] = [];
  const fresh: GameQuestion[] = [];
  const scheduled: GameQuestion[] = [];

  for (const q of pool) {
    const progress = progressMap.get(q.id);
    if (!progress) {
      fresh.push(q);
    } else if (progress.nextReview <= now) {
      due.push(q);
    } else {
      scheduled.push(q);
    }
  }

  // Priority: overdue reviews → new questions → not-yet-due questions
  const ordered = [...shuffle(due), ...shuffle(fresh), ...shuffle(scheduled)];
  const questions = ordered.slice(0, count);

  return NextResponse.json({ questions });
}
