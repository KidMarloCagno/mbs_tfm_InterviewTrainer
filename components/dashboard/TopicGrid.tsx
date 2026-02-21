"use client";

import { useState } from "react";
import {
  SessionConfigModal,
  type TypeCounts,
} from "@/components/quiz/SessionConfigModal";

interface TopicGridProps {
  topics: string[];
  topicStats: Record<string, TypeCounts>;
}

export function TopicGrid({ topics, topicStats }: TopicGridProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <>
      <div className="grid-topics">
        {topics.map((topic) => (
          <div className="ui-card" key={topic}>
            <div className="ui-card-header">
              <h3
                className="ui-card-title mono"
                style={{ fontSize: "1.05rem" }}
              >
                {topic}
              </h3>
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

      {selectedTopic !== null ? (
        <SessionConfigModal
          topic={selectedTopic}
          typeCounts={
            topicStats[selectedTopic] ?? {
              total: 0,
              QUIZ_SIMPLE: 0,
              TRUE_FALSE: 0,
              FILL_THE_BLANK: 0,
            }
          }
          onClose={() => setSelectedTopic(null)}
        />
      ) : null}
    </>
  );
}
