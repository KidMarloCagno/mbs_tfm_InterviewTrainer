/**
 * RemixCard component tests — IMPORTANT TIER
 *
 * Strategy:
 * - Empty state (remixStats.total === 0):
 *     · Shows "Practice some topics first to unlock Remix."
 *     · "Start Remix →" button is disabled.
 *     · Clicking the card div does NOT open the modal.
 * - Non-empty state (remixStats.total > 0):
 *     · Shows total count and topic count.
 *     · "Start Remix →" button is enabled.
 *     · Clicking the button opens SessionConfigModal via React portal.
 *     · Clicking the card div also opens the modal.
 * - SessionConfigModal rendered via createPortal to document.body — screen
 *   queries still find it because RTL searches the whole document.
 * - next/navigation is mocked because SessionConfigModal uses useRouter internally.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { RemixCard } from "@/components/dashboard/RemixCard";
import type {
  TypeCounts,
  StudiedTopic,
} from "@/components/quiz/SessionConfigModal";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const emptyStats: TypeCounts = {
  total: 0,
  QUIZ_SIMPLE: 0,
  TRUE_FALSE: 0,
  FILL_THE_BLANK: 0,
};

const fullStats: TypeCounts = {
  total: 50,
  QUIZ_SIMPLE: 25,
  TRUE_FALSE: 15,
  FILL_THE_BLANK: 10,
};

const studiedTopics: StudiedTopic[] = [
  {
    topic: "Database",
    counts: { total: 30, QUIZ_SIMPLE: 15, TRUE_FALSE: 10, FILL_THE_BLANK: 5 },
  },
  {
    topic: "Networking",
    counts: { total: 20, QUIZ_SIMPLE: 10, TRUE_FALSE: 5, FILL_THE_BLANK: 5 },
  },
];

describe("RemixCard", () => {
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

  // ─── Empty state ──────────────────────────────────────────────────────────

  it("shows the unlock hint when there are no studied questions", () => {
    // Arrange & Act
    render(<RemixCard remixStats={emptyStats} studiedTopics={[]} />);
    // Assert
    expect(
      screen.getByText("Practice some topics first to unlock Remix."),
    ).toBeInTheDocument();
  });

  it('disables the "Start Remix →" button when stats are empty', () => {
    // Arrange & Act
    render(<RemixCard remixStats={emptyStats} studiedTopics={[]} />);
    // Assert
    expect(
      screen.getByRole("button", { name: "Start Remix →" }),
    ).toBeDisabled();
  });

  it("does NOT open the modal when the card is clicked in empty state", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RemixCard remixStats={emptyStats} studiedTopics={[]} />);
    // Act — click the card wrapper (not the button which is disabled)
    const card = screen
      .getByRole("button", { name: "Start Remix →" })
      .closest(".remix-sidebar-card") as HTMLElement;
    await user.click(card);
    // Assert — no modal should appear
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ─── Non-empty state ──────────────────────────────────────────────────────

  it("shows the total question count and topic count", () => {
    // Arrange & Act
    render(<RemixCard remixStats={fullStats} studiedTopics={studiedTopics} />);
    // Assert
    expect(screen.getByText(/50 questions/)).toBeInTheDocument();
    expect(screen.getByText(/2 topics/)).toBeInTheDocument();
  });

  it('shows singular "topic" when only 1 studied topic exists', () => {
    // Arrange & Act
    render(
      <RemixCard
        remixStats={{
          total: 20,
          QUIZ_SIMPLE: 10,
          TRUE_FALSE: 5,
          FILL_THE_BLANK: 5,
        }}
        studiedTopics={[studiedTopics[0]]}
      />,
    );
    // Assert — "1 topic" (no 's')
    expect(screen.getByText(/1 topic$/)).toBeInTheDocument();
  });

  it('enables the "Start Remix →" button when stats are non-empty', () => {
    // Arrange & Act
    render(<RemixCard remixStats={fullStats} studiedTopics={studiedTopics} />);
    // Assert
    expect(
      screen.getByRole("button", { name: "Start Remix →" }),
    ).not.toBeDisabled();
  });

  it('opens SessionConfigModal when "Start Remix →" is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RemixCard remixStats={fullStats} studiedTopics={studiedTopics} />);
    // Act
    await user.click(screen.getByRole("button", { name: "Start Remix →" }));
    // Assert — modal is rendered into document.body via portal; screen still finds it
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Configure Session")).toBeInTheDocument();
  });

  it("closes the SessionConfigModal when its onClose is triggered", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RemixCard remixStats={fullStats} studiedTopics={studiedTopics} />);
    await user.click(screen.getByRole("button", { name: "Start Remix →" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Act — click the modal's close button
    await user.click(screen.getByRole("button", { name: "Close" }));
    // Assert
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the Remix description text", () => {
    // Arrange & Act
    render(<RemixCard remixStats={fullStats} studiedTopics={studiedTopics} />);
    // Assert
    expect(
      screen.getByText(/Questions you.+ve reviewed, mixed across all topics/),
    ).toBeInTheDocument();
  });

  it('shows the "Remix" heading', () => {
    // Arrange & Act
    render(<RemixCard remixStats={fullStats} studiedTopics={studiedTopics} />);
    // Assert
    expect(screen.getByText("Remix")).toBeInTheDocument();
  });
});
