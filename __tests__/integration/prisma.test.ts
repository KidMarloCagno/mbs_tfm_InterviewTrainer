import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL_TEST;

if (!databaseUrl) {
  describe.skip('Prisma integration', () => {
    it('skips when DATABASE_URL_TEST is not set', () => {});
  });
} else {
  describe('Prisma integration', () => {
    const prisma = new PrismaClient({
      datasources: {
        db: { url: databaseUrl },
      },
    });

    beforeAll(async () => {
      await prisma.$connect();
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    it('persists quiz progress records', async () => {
      const user = await prisma.user.create({
        data: { email: `test-${Date.now()}@quizview.dev` },
      });

      const question = await prisma.question.create({
        data: {
          id: `q-${Date.now()}`,
          question: 'What is SM-2 used for?',
          answer: 'Spaced repetition scheduling',
          options: ['Spaced repetition scheduling', 'Sorting arrays', 'Binary search', 'Session tokens'],
          category: 'Testing',
          type: 'QUIZ_SIMPLE',
          level: 'Beginner',
        },
      });

      const progress = await prisma.userProgress.create({
        data: {
          userId: user.id,
          questionId: question.id,
          repetition: 1,
          interval: 1,
          easinessFactor: 2.5,
          nextReview: new Date(),
        },
      });

      const stored = await prisma.userProgress.findUnique({
        where: {
          userId_questionId: { userId: user.id, questionId: question.id },
        },
      });

      expect(stored).not.toBeNull();

      await prisma.userProgress.delete({ where: { id: progress.id } });
      await prisma.question.delete({ where: { id: question.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });
}
