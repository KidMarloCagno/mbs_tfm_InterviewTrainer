"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SessionConfigModal,
  type TypeCounts,
} from "@/components/quiz/SessionConfigModal";

interface TopicGridProps {
  topics: string[];
  topicStats: Record<string, TypeCounts>;
  userId?: string;
}

const STORAGE_KEY_PREFIX = "quizview:hidden-topics";

function getStorageKey(userId?: string): string {
  return `${STORAGE_KEY_PREFIX}:${userId ?? "anonymous"}`;
}

function readHiddenTopics(storageKey: string): Set<string> {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) return new Set<string>();

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();

    return new Set(
      parsed.filter((topic): topic is string => typeof topic === "string"),
    );
  } catch {
    return new Set<string>();
  }
}

function writeHiddenTopics(
  storageKey: string,
  hiddenTopics: Set<string>,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify([...hiddenTopics]));
}

const zeroTypeCounts: TypeCounts = {
  total: 0,
  QUIZ_SIMPLE: 0,
  TRUE_FALSE: 0,
  FILL_THE_BLANK: 0,
};

export function TopicGrid({ topics, topicStats, userId }: TopicGridProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [hiddenTopics, setHiddenTopics] = useState<Set<string>>(
    () => new Set<string>(),
  );

  const storageKey = getStorageKey(userId);

  useEffect(() => {
    const storedHiddenTopics = readHiddenTopics(storageKey);
    setHiddenTopics(
      new Set(topics.filter((topic) => storedHiddenTopics.has(topic))),
    );
  }, [storageKey, topics]);

  const visibleTopics = useMemo(
    () => topics.filter((topic) => !hiddenTopics.has(topic)),
    [hiddenTopics, topics],
  );
  const otherTopics = useMemo(
    () => topics.filter((topic) => hiddenTopics.has(topic)),
    [hiddenTopics, topics],
  );

  const updateHiddenTopics = (
    updater: (current: Set<string>) => Set<string>,
  ) => {
    setHiddenTopics((current) => {
      const requestedNext = updater(new Set(current));
      const next = new Set(topics.filter((topic) => requestedNext.has(topic)));
      writeHiddenTopics(storageKey, next);
      return next;
    });
  };

  const hideTopic = (topic: string) => {
    updateHiddenTopics((current) => new Set(current).add(topic));
    if (selectedTopic === topic) {
      setSelectedTopic(null);
    }
  };

  const restoreTopic = (topic: string) => {
    updateHiddenTopics((current) => {
      const next = new Set(current);
      next.delete(topic);
      return next;
    });
  };

  return (
    <>
      <div className="grid-topics">
        {visibleTopics.map((topic) => (
          <div className="ui-card" key={topic}>
            <div className="ui-card-header">
              <div className="topic-card-title-row">
                <h3
                  className="ui-card-title mono"
                  style={{ fontSize: "1.05rem" }}
                >
                  {topic}
                </h3>
                <button
                  type="button"
                  className="topic-card-hide-button"
                  onClick={() => hideTopic(topic)}
                  aria-label={`Hide ${topic}`}
                  title={`Hide ${topic}`}
                >
                  Hide
                </button>
              </div>
              <p className="ui-card-description">
                Adaptive interview drills with active recall and spaced
                repetition.
              </p>
            </div>
            <div className="ui-card-content">
              <button
                type="button"
                className="ui-button ui-button-default ui-button-lg ui-button-block"
                onClick={() => setSelectedTopic(topic)}
              >
                Start Practice
              </button>
            </div>
          </div>
        ))}
      </div>

      {topics.length === 0 ? (
        <div
          className="glass-banner"
          style={{ marginTop: "1rem", textAlign: "center" }}
        >
          <p className="text-muted">
            No topics available yet. Add question sets in prisma/data/sets.
          </p>
        </div>
      ) : null}

      {topics.length > 0 && visibleTopics.length === 0 ? (
        <div
          className="glass-banner"
          style={{ marginTop: "1rem", textAlign: "center" }}
        >
          <p className="text-muted">
            All topics are currently hidden in Others. Use Add to Study to bring
            one back.
          </p>
        </div>
      ) : null}

      {otherTopics.length > 0 ? (
        <section className="others-topics-block" aria-labelledby="others-title">
          <div className="others-topics-header">
            <div>
              <p className="text-muted others-topics-eyebrow">Hidden topics</p>
              <h2 className="mono others-topics-title" id="others-title">
                Others
              </h2>
            </div>
            <p className="text-muted others-topics-count">
              {otherTopics.length} topic{otherTopics.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="others-topics-list">
            {otherTopics.map((topic) => (
              <div className="others-topic-row" key={topic}>
                <div>
                  <p className="mono others-topic-name">{topic}</p>
                  <p className="text-muted others-topic-description">
                    Hidden from your main study grid.
                  </p>
                </div>
                <button
                  type="button"
                  className="ui-button ui-button-outline"
                  onClick={() => restoreTopic(topic)}
                >
                  Add to Study
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {selectedTopic !== null ? (
        <SessionConfigModal
          topic={selectedTopic}
          typeCounts={topicStats[selectedTopic] ?? zeroTypeCounts}
          onClose={() => setSelectedTopic(null)}
        />
      ) : null}
    </>
  );
}
