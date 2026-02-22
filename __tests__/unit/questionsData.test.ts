/**
 * lib/questions-data — CORE TIER (100% coverage required)
 *
 * Strategy:
 * - No mocks needed: vitest resolves JSON imports via the @ alias configured
 *   in vitest.config.ts (resolve.alias: { '@': '.' }).
 * - All three exported functions are pure: test via inputs → outputs only.
 * - Shape/structure assertions catch regressions when new JSON sets are added.
 */
import { describe, it, expect } from "vitest";
import {
  getAvailableTopics,
  getQuestionsByTopic,
  getAllQuestions,
} from "@/lib/questions-data";

describe("getAvailableTopics", () => {
  it("returns a sorted array of strings", () => {
    // Arrange & Act
    const topics = getAvailableTopics();
    // Assert — result is a non-empty sorted array
    expect(Array.isArray(topics)).toBe(true);
    expect(topics.length).toBeGreaterThan(0);
    const sorted = [...topics].sort((a, b) => a.localeCompare(b));
    expect(topics).toEqual(sorted);
  });

  it("includes all 11 registered topic keys", () => {
    // Arrange & Act
    const topics = getAvailableTopics();
    // Assert — one entry per JSON set in prisma/data/sets/
    const expected = [
      "Angular",
      "Backend",
      "Database",
      "Django",
      "Frontend",
      "Java",
      "JavaScript",
      "Python",
      "React",
      "Spring",
      "SystemsDesign",
    ];
    for (const t of expected) {
      expect(topics).toContain(t);
    }
    expect(topics).toHaveLength(expected.length);
  });
});

describe("getQuestionsByTopic", () => {
  it("returns a non-empty array for the Database topic", () => {
    // Arrange & Act
    const questions = getQuestionsByTopic("Database");
    // Assert
    expect(questions.length).toBeGreaterThan(0);
  });

  it("returns a non-empty array for the JavaScript topic", () => {
    // Arrange & Act
    const questions = getQuestionsByTopic("JavaScript");
    // Assert
    expect(questions.length).toBeGreaterThan(0);
  });

  it("returns an empty array for an unknown topic", () => {
    // Arrange & Act
    const questions = getQuestionsByTopic("UnknownTopic");
    // Assert
    expect(questions).toEqual([]);
  });

  it("all questions in the Database set have the required GameQuestion fields", () => {
    // Arrange & Act
    const questions = getQuestionsByTopic("Database");
    // Assert — every question must carry the mandatory fields
    for (const q of questions) {
      expect(typeof q.id).toBe("string");
      expect(q.id.length).toBeGreaterThan(0);
      expect(typeof q.question).toBe("string");
      expect(typeof q.answer).toBe("string");
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBeGreaterThan(0);
      expect(typeof q.category).toBe("string");
      expect(["QUIZ_SIMPLE", "TRUE_FALSE", "FILL_THE_BLANK"]).toContain(q.type);
      expect(["Beginner", "Intermediate", "Advanced"]).toContain(q.level);
    }
  });
});

describe("getAllQuestions", () => {
  it("returns at least the combined count of all per-topic arrays", () => {
    // Arrange
    const topics = getAvailableTopics();
    const perTopicTotal = topics.reduce(
      (sum, t) => sum + getQuestionsByTopic(t).length,
      0,
    );
    // Act
    const all = getAllQuestions();
    // Assert
    expect(all.length).toBeGreaterThanOrEqual(perTopicTotal);
  });

  it("contains no duplicate question IDs across all topics", () => {
    // Arrange & Act
    const all = getAllQuestions();
    const ids = all.map((q) => q.id);
    // Assert — Set size equals array length iff every ID is unique
    expect(new Set(ids).size).toBe(ids.length);
  });
});
