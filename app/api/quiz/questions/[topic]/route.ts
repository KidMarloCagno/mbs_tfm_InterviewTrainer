import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getQuestionsByTopic } from "@/lib/questions-data";
import { prisma } from "@/lib/prisma";
import type { GameQuestion } from "@/components/game/GameEngine";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { topic: string } },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const topic = decodeURIComponent(params.topic);
  const allQuestions = getQuestionsByTopic(topic);

  if (allQuestions.length === 0) {
    return NextResponse.json({ error: "Unknown topic." }, { status: 400 });
  }

  const questionIds = allQuestions.map((q) => q.id);

  const progressRecords = await prisma.userProgress.findMany({
    where: { userId, questionId: { in: questionIds } },
    select: { questionId: true, nextReview: true },
  });

  const progressMap = new Map(progressRecords.map((p) => [p.questionId, p]));
  const now = new Date();

  const due: GameQuestion[] = [];
  const fresh: GameQuestion[] = [];
  const scheduled: GameQuestion[] = [];

  for (const q of allQuestions) {
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
  const questions = ordered.slice(0, 10);

  return NextResponse.json({ questions });
}
