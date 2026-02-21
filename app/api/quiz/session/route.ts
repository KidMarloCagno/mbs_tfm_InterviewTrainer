import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateSM2 } from "@/lib/sm2";

const sessionSchema = z.object({
  results: z
    .array(
      z.object({
        questionId: z.string().min(1),
        quality: z.union([
          z.literal(0),
          z.literal(1),
          z.literal(2),
          z.literal(3),
          z.literal(4),
          z.literal(5),
        ]),
      }),
    )
    .min(1)
    .max(20),
});

interface ScheduledItem {
  questionId: string;
  nextReview: Date;
  interval: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid session data." },
      { status: 400 },
    );
  }

  const { results } = parsed.data;

  // Fetch all existing progress in one query to minimise round-trips
  const questionIds = results.map((r) => r.questionId);
  const existing = await prisma.userProgress.findMany({
    where: { userId, questionId: { in: questionIds } },
  });
  const existingMap = new Map(existing.map((e) => [e.questionId, e]));

  const scheduled: ScheduledItem[] = [];
  let saved = 0;

  for (const { questionId, quality } of results) {
    const prev = existingMap.get(questionId);
    const sm2 = calculateSM2({
      quality,
      previousInterval: prev?.interval ?? 1,
      previousRepetition: prev?.repetition ?? 0,
      previousEF: prev?.easinessFactor ?? 2.5,
    });

    try {
      await prisma.userProgress.upsert({
        where: { userId_questionId: { userId, questionId } },
        create: {
          userId,
          questionId,
          repetition: sm2.repetition,
          interval: sm2.interval,
          easinessFactor: sm2.easinessFactor,
          nextReview: sm2.nextReview,
        },
        update: {
          repetition: sm2.repetition,
          interval: sm2.interval,
          easinessFactor: sm2.easinessFactor,
          nextReview: sm2.nextReview,
        },
      });
      scheduled.push({
        questionId,
        nextReview: sm2.nextReview,
        interval: sm2.interval,
      });
      saved++;
    } catch {
      // Question not in DB (not yet seeded) — skip silently
    }
  }

  // Update lastActivity outside the per-question loop
  await prisma.user.update({
    where: { id: userId },
    data: { lastActivity: new Date() },
  });

  return NextResponse.json({ saved, scheduled });
}
