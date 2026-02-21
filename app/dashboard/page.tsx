import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getAvailableTopics, getQuestionsByTopic } from "@/lib/questions-data";
import { ThemeSelect } from "@/components/theme/ThemeSelect";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { TopicGrid } from "@/components/dashboard/TopicGrid";
import type { TypeCounts } from "@/components/quiz/SessionConfigModal";

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

  return (
    <div className="app-shell">
      <ThemeSelect />
      <LogoutButton />
      <div
        className="container"
        style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}
      >
        <div
          className="glass-banner"
          style={{
            width: "320px",
            minWidth: "320px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            padding: "2rem 1.5rem",
            position: "sticky",
            top: "2rem",
          }}
        >
          <Image
            src="/logo.png"
            alt="Interview Trainer Logo"
            width={150}
            height={150}
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
                fontSize: "1.75rem",
                marginBottom: ".5rem",
                color: "var(--primary)",
              }}
            >
              {session.user?.name ?? "there"}
            </h1>
            <p className="text-muted" style={{ margin: 0, fontSize: ".9rem" }}>
              Your prep for IT interviews. Do not just hoot, execute.
            </p>
          </div>
          <div className="ui-badge mono" style={{ marginTop: ".5rem" }}>
            Tier Path: Junior {"->"} Architect
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <TopicGrid topics={topics} topicStats={topicStats} />
        </div>
      </div>
    </div>
  );
}
