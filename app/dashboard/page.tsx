import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import {
  getAvailableTopics,
  getQuestionsByTopic,
  getAllQuestions,
} from "@/lib/questions-data";
import { prisma } from "@/lib/prisma";
import { ThemeSelect } from "@/components/theme/ThemeSelect";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { TopicGrid } from "@/components/dashboard/TopicGrid";
import { RemixCard } from "@/components/dashboard/RemixCard";
import type {
  TypeCounts,
  StudiedTopic,
} from "@/components/quiz/SessionConfigModal";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const topics = getAvailableTopics();

  // Compute per-type question counts for each topic (used by SessionConfigModal)
  const topicStats: Record<string, TypeCounts> = {};
  for (const topic of topics) {
    const questions = getQuestionsByTopic(topic);
    topicStats[topic] = {
      total: questions.length,
      QUIZ_SIMPLE: questions.filter((q) => q.type === "QUIZ_SIMPLE").length,
      TRUE_FALSE: questions.filter((q) => q.type === "TRUE_FALSE").length,
      FILL_THE_BLANK: questions.filter((q) => q.type === "FILL_THE_BLANK")
        .length,
    };
  }

  // Remix: only questions the user has already studied (has a UserProgress record)
  const studiedRecords = await prisma.userProgress.findMany({
    where: { userId: session.user.id },
    select: { questionId: true },
  });
  const studiedIds = new Set(studiedRecords.map((r) => r.questionId));

  // Per-topic studied counts (only topics with at least one studied question)
  const studiedTopics: StudiedTopic[] = topics.flatMap((t) => {
    const tq = getQuestionsByTopic(t).filter((q) => studiedIds.has(q.id));
    if (tq.length === 0) return [];
    return [
      {
        topic: t,
        counts: {
          total: tq.length,
          QUIZ_SIMPLE: tq.filter((q) => q.type === "QUIZ_SIMPLE").length,
          TRUE_FALSE: tq.filter((q) => q.type === "TRUE_FALSE").length,
          FILL_THE_BLANK: tq.filter((q) => q.type === "FILL_THE_BLANK").length,
        },
      },
    ];
  });

  const studiedQ = getAllQuestions().filter((q) => studiedIds.has(q.id));
  const remixStats: TypeCounts = {
    total: studiedQ.length,
    QUIZ_SIMPLE: studiedQ.filter((q) => q.type === "QUIZ_SIMPLE").length,
    TRUE_FALSE: studiedQ.filter((q) => q.type === "TRUE_FALSE").length,
    FILL_THE_BLANK: studiedQ.filter((q) => q.type === "FILL_THE_BLANK").length,
  };

  return (
    <div className="app-shell">
      <ThemeSelect />
      <LogoutButton />
      <div
        className="container"
        style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}
      >
        {/* Left column — sticky as a unit */}
        <div
          style={{
            width: "320px",
            minWidth: "320px",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            position: "sticky",
            top: "2rem",
            alignSelf: "flex-start",
          }}
        >
          <div
            className="glass-banner"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              padding: "1.4rem 1.5rem",
            }}
          >
            <Image
              src="/logo.png"
              alt="Interview Trainer Logo"
              width={110}
              height={110}
              priority
              style={{ borderRadius: "12px" }}
            />
            <div style={{ textAlign: "center" }}>
              <p
                className="text-muted"
                style={{
                  margin: "0 0 0.2rem",
                  fontSize: ".75rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Welcome back,
              </p>
              <h1
                className="mono"
                style={{
                  margin: 0,
                  fontSize: "1.6rem",
                  color: "var(--primary)",
                }}
              >
                {session.user?.name ?? "there"}
              </h1>
            </div>
            <div className="ui-badge mono">
              Tier Path: Junior {"->"} Architect
            </div>
          </div>

          <RemixCard remixStats={remixStats} studiedTopics={studiedTopics} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <TopicGrid topics={topics} topicStats={topicStats} />
        </div>
      </div>
    </div>
  );
}
