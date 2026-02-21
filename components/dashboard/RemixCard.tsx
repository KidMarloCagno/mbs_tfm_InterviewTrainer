"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  SessionConfigModal,
  type TypeCounts,
  type StudiedTopic,
} from "@/components/quiz/SessionConfigModal";

interface RemixCardProps {
  remixStats: TypeCounts;
  studiedTopics: StudiedTopic[];
}

export function RemixCard({ remixStats, studiedTopics }: RemixCardProps) {
  const [open, setOpen] = useState(false);
  const isEmpty = remixStats.total === 0;

  return (
    <>
      <div
        className="remix-sidebar-card"
        onClick={() => {
          if (!isEmpty) setOpen(true);
        }}
        style={isEmpty ? { cursor: "default", opacity: 0.6 } : undefined}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="remix-icon-wrapper">
            <svg
              className="remix-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="16 3 21 3 21 8" />
              <path d="M4.5 15.5A9 9 0 0 0 21 8" />
              <polyline points="8 21 3 21 3 16" />
              <path d="M19.5 8.5A9 9 0 0 0 3 16" />
            </svg>
          </div>
          <h3 className="remix-title mono">Remix</h3>
        </div>
        <p className="remix-description">
          Questions you&apos;ve reviewed, mixed across all topics.
        </p>
        {isEmpty ? (
          <p className="remix-meta">
            Practice some topics first to unlock Remix.
          </p>
        ) : (
          <p className="remix-meta">
            ◉ {remixStats.total} questions · {studiedTopics.length} topic
            {studiedTopics.length === 1 ? "" : "s"}
          </p>
        )}
        <button
          type="button"
          className="ui-button ui-button-default ui-button-lg ui-button-block"
          disabled={isEmpty}
          onClick={(e) => {
            e.stopPropagation();
            if (!isEmpty) setOpen(true);
          }}
        >
          Start Remix →
        </button>
      </div>

      {open
        ? createPortal(
            <SessionConfigModal
              topic="Remix"
              typeCounts={remixStats}
              onClose={() => setOpen(false)}
              studiedTopics={studiedTopics}
            />,
            document.body,
          )
        : null}
    </>
  );
}
