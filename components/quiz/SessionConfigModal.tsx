"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { GameQuestionType } from "@/components/game/GameEngine";

type TypeFilter = GameQuestionType | "mixed";

export interface TypeCounts {
  total: number;
  QUIZ_SIMPLE: number;
  TRUE_FALSE: number;
  FILL_THE_BLANK: number;
}

export interface StudiedTopic {
  topic: string; // questionsData key (e.g. "Database", "SystemsDesign")
  counts: TypeCounts;
}

interface SessionConfigModalProps {
  topic: string;
  typeCounts: TypeCounts;
  onClose: () => void;
  studiedTopics?: StudiedTopic[]; // only passed for Remix
}

const COUNT_OPTIONS = [10, 20, 30] as const;

const TYPE_OPTIONS: Array<{ value: TypeFilter; label: string }> = [
  { value: "mixed", label: "Mixed" },
  { value: "QUIZ_SIMPLE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "FILL_THE_BLANK", label: "Fill the Blank" },
];

function getAvailable(typeCounts: TypeCounts, filter: TypeFilter): number {
  return filter === "mixed" ? typeCounts.total : typeCounts[filter];
}

function sumCounts(topics: StudiedTopic[], selected: Set<string>): TypeCounts {
  return topics
    .filter((t) => selected.has(t.topic))
    .reduce<TypeCounts>(
      (acc, t) => ({
        total: acc.total + t.counts.total,
        QUIZ_SIMPLE: acc.QUIZ_SIMPLE + t.counts.QUIZ_SIMPLE,
        TRUE_FALSE: acc.TRUE_FALSE + t.counts.TRUE_FALSE,
        FILL_THE_BLANK: acc.FILL_THE_BLANK + t.counts.FILL_THE_BLANK,
      }),
      { total: 0, QUIZ_SIMPLE: 0, TRUE_FALSE: 0, FILL_THE_BLANK: 0 },
    );
}

export function SessionConfigModal({
  topic,
  typeCounts,
  onClose,
  studiedTopics,
}: SessionConfigModalProps) {
  const router = useRouter();
  const [count, setCount] = useState<number>(10);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("mixed");
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(
    () => new Set((studiedTopics ?? []).map((t) => t.topic)),
  );
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape key closes modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Focus first button on open
  useEffect(() => {
    dialogRef.current
      ?.querySelector<HTMLElement>("button:not([disabled])")
      ?.focus();
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose],
  );

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(t)) {
        next.delete(t);
      } else {
        next.add(t);
      }
      return next;
    });
  };

  // For Remix: derive counts from selected topics; otherwise use prop directly
  const effectiveTypeCounts: TypeCounts =
    studiedTopics != null
      ? sumCounts(studiedTopics, selectedTopics)
      : typeCounts;

  const available = getAvailable(effectiveTypeCounts, typeFilter);
  const effectiveCount = Math.min(count, available);

  const handleStart = () => {
    const qs = new URLSearchParams({
      count: String(effectiveCount),
      type: typeFilter,
    });
    if (studiedTopics != null && selectedTopics.size > 0) {
      qs.set("topics", [...selectedTopics].join(","));
    }
    router.push(`/quiz/${encodeURIComponent(topic)}?${qs.toString()}`);
  };

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-cfg-title"
    >
      <div className="modal-panel" ref={dialogRef}>
        <div className="modal-header">
          <h2 className="modal-title mono" id="session-cfg-title">
            Configure Session
          </h2>
          <p className="modal-description">
            {topic} — pick your drill settings
          </p>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Topic selector — Remix only */}
        {studiedTopics != null ? (
          <div className="session-config-section">
            <p className="session-config-label">Include sets</p>
            <div className="session-config-pills" style={{ flexWrap: "wrap" }}>
              {studiedTopics.map(({ topic: t, counts }) => (
                <button
                  key={t}
                  type="button"
                  className={`session-config-pill${selectedTopics.has(t) ? " active" : ""}`}
                  onClick={() => toggleTopic(t)}
                >
                  {t}{" "}
                  <span className="session-config-pill-count">
                    ({counts.total})
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Question count selector */}
        <div className="session-config-section">
          <p className="session-config-label">Questions per session</p>
          <div className="session-config-pills">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                className={`session-config-pill${count === n ? " active" : ""}`}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Question type selector */}
        <div className="session-config-section">
          <p className="session-config-label">Question type</p>
          <div className="session-config-pills">
            {TYPE_OPTIONS.map(({ value, label }) => {
              const n = getAvailable(effectiveTypeCounts, value);
              const disabled = n === 0;
              return (
                <button
                  key={value}
                  type="button"
                  className={`session-config-pill${typeFilter === value ? " active" : ""}`}
                  onClick={() => !disabled && setTypeFilter(value)}
                  disabled={disabled}
                  title={
                    disabled ? "No questions of this type available" : undefined
                  }
                >
                  {label}{" "}
                  <span className="session-config-pill-count">({n})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Warning when count exceeds available */}
        {effectiveCount < count && available > 0 ? (
          <p
            className="text-muted"
            style={{ fontSize: ".8rem", margin: "0 0 1rem" }}
          >
            Only {available} question{available !== 1 ? "s" : ""} available —
            session capped at {effectiveCount}.
          </p>
        ) : null}

        <Button
          className="ui-button-block"
          onClick={handleStart}
          disabled={effectiveCount === 0}
        >
          Start Session →
        </Button>
      </div>
    </div>
  );
}
