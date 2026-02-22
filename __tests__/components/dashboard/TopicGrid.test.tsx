/**
 * TopicGrid component tests — IMPORTANT TIER
 *
 * Strategy:
 * - Renders one card per topic in the topics array.
 * - Empty topics array renders the "No topics available" banner.
 * - Each topic card has a "Start Practice" button.
 * - Clicking "Start Practice" opens SessionConfigModal for that topic.
 * - The modal shows the topic description "{topic} — pick your drill settings".
 * - Clicking the modal's close button dismisses it.
 * - Clicking a different topic while no modal is open opens the right modal.
 * - next/navigation is mocked because SessionConfigModal uses useRouter.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { TopicGrid } from "@/components/dashboard/TopicGrid";
import type { TypeCounts } from "@/components/quiz/SessionConfigModal";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCounts = (total: number): TypeCounts => ({
  total,
  QUIZ_SIMPLE: Math.floor(total / 2),
  TRUE_FALSE: Math.floor(total / 4),
  FILL_THE_BLANK: total - Math.floor(total / 2) - Math.floor(total / 4),
});

const topics = ["JavaScript", "Python", "Docker"];

const topicStats: Record<string, TypeCounts> = {
  JavaScript: mockCounts(60),
  Python: mockCounts(40),
  Docker: mockCounts(20),
};

describe("TopicGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
  });

  // ─── Topic cards rendering ─────────────────────────────────────────────────

  it("renders a card for each topic", () => {
    // Arrange & Act
    render(<TopicGrid topics={topics} topicStats={topicStats} />);
    // Assert
    topics.forEach((topic) => {
      expect(screen.getByText(topic)).toBeInTheDocument();
    });
  });

  it('renders a "Start Practice" button for each topic', () => {
    // Arrange & Act
    render(<TopicGrid topics={topics} topicStats={topicStats} />);
    // Assert — there should be one Start Practice button per topic
    const buttons = screen.getAllByRole("button", { name: "Start Practice" });
    expect(buttons).toHaveLength(topics.length);
  });

  // ─── Empty state ──────────────────────────────────────────────────────────

  it('shows the "No topics available" banner when topics array is empty', () => {
    // Arrange & Act
    render(<TopicGrid topics={[]} topicStats={{}} />);
    // Assert
    expect(
      screen.getByText(
        "No topics available yet. Add question sets in prisma/data/sets.",
      ),
    ).toBeInTheDocument();
  });

  it("does NOT show the empty banner when topics exist", () => {
    // Arrange & Act
    render(<TopicGrid topics={topics} topicStats={topicStats} />);
    // Assert
    expect(screen.queryByText(/No topics available/)).not.toBeInTheDocument();
  });

  it("renders no topic cards when topics is empty", () => {
    // Arrange & Act
    render(<TopicGrid topics={[]} topicStats={{}} />);
    // Assert
    expect(
      screen.queryByRole("button", { name: "Start Practice" }),
    ).not.toBeInTheDocument();
  });

  // ─── Modal opening ────────────────────────────────────────────────────────

  it("opens the SessionConfigModal for the clicked topic", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TopicGrid topics={topics} topicStats={topicStats} />);
    const buttons = screen.getAllByRole("button", { name: "Start Practice" });
    // Act — click the first topic (JavaScript)
    await user.click(buttons[0]);
    // Assert
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText("JavaScript — pick your drill settings"),
    ).toBeInTheDocument();
  });

  it("shows the correct topic name in the modal description", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TopicGrid topics={topics} topicStats={topicStats} />);
    const buttons = screen.getAllByRole("button", { name: "Start Practice" });
    // Act — click Python (index 1)
    await user.click(buttons[1]);
    // Assert
    expect(
      screen.getByText("Python — pick your drill settings"),
    ).toBeInTheDocument();
  });

  it("closes the modal when its close button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TopicGrid topics={topics} topicStats={topicStats} />);
    await user.click(
      screen.getAllByRole("button", { name: "Start Practice" })[0],
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Act
    await user.click(screen.getByRole("button", { name: "Close" }));
    // Assert
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the modal on Escape key", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TopicGrid topics={topics} topicStats={topicStats} />);
    await user.click(
      screen.getAllByRole("button", { name: "Start Practice" })[0],
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Act
    await user.keyboard("{Escape}");
    // Assert
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ─── Fallback typeCounts ──────────────────────────────────────────────────

  it("passes zero typeCounts when the topic has no entry in topicStats", async () => {
    // Arrange — "NewTopic" is NOT in topicStats
    const user = userEvent.setup();
    render(<TopicGrid topics={["NewTopic"]} topicStats={{}} />);
    // Act
    await user.click(screen.getByRole("button", { name: "Start Practice" }));
    // Assert — modal opens (the Start Session button will be disabled since total=0)
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start Session/ }),
    ).toBeDisabled();
  });
});
