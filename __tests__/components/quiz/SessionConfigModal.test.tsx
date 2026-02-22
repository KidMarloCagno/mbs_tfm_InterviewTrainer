/**
 * SessionConfigModal component tests — IMPORTANT TIER (critical UX + URL generation)
 *
 * Strategy:
 * - Render / close interactions: visible, close button, Escape key, backdrop click.
 * - Count pill selection (10 / 20 / 30) updates the displayed effective count.
 * - Type filter pills: selecting a type, disabled when 0 questions available.
 * - Warning message when selected count > available questions.
 * - "Start Session →" button is disabled when effectiveCount === 0.
 * - handleStart builds the correct URL and calls router.push:
 *     · Normal mode: /quiz/{topic}?count=N&type=T
 *     · Remix mode with topics: /quiz/Remix?count=N&type=T&topics=A,B
 * - Remix mode: topic pills rendered, toggling a pill updates effective counts.
 *
 * Internal helpers (sumCounts, getAvailable) are tested implicitly through the
 * rendered UI rather than exported directly (they are unexported module internals).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import {
  SessionConfigModal,
  type TypeCounts,
  type StudiedTopic,
} from "@/components/quiz/SessionConfigModal";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const mockPush = vi.fn();

function buildRouter() {
  return {
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>;
}

const jsCounts: TypeCounts = {
  total: 60,
  QUIZ_SIMPLE: 30,
  TRUE_FALSE: 20,
  FILL_THE_BLANK: 10,
};

const zeroCounts: TypeCounts = {
  total: 0,
  QUIZ_SIMPLE: 0,
  TRUE_FALSE: 0,
  FILL_THE_BLANK: 0,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderModal(
  topic = "JavaScript",
  typeCounts = jsCounts,
  onClose = vi.fn(),
  studiedTopics?: StudiedTopic[],
) {
  return render(
    <SessionConfigModal
      topic={topic}
      typeCounts={typeCounts}
      onClose={onClose}
      studiedTopics={studiedTopics}
    />,
  );
}

describe("SessionConfigModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(buildRouter());
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders the "Configure Session" heading', () => {
    // Arrange & Act
    renderModal();
    // Assert
    expect(screen.getByText("Configure Session")).toBeInTheDocument();
  });

  it("renders the topic description line", () => {
    // Arrange & Act
    renderModal("Docker");
    // Assert
    expect(
      screen.getByText("Docker — pick your drill settings"),
    ).toBeInTheDocument();
  });

  it("renders count pills (10, 20, 30)", () => {
    // Arrange & Act
    renderModal();
    // Assert
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "20" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30" })).toBeInTheDocument();
  });

  it("renders type filter pills", () => {
    // Arrange & Act
    renderModal();
    // Assert
    expect(screen.getByRole("button", { name: /Mixed/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Multiple Choice/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /True \/ False/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Fill the Blank/ }),
    ).toBeInTheDocument();
  });

  it('renders the "Start Session →" button', () => {
    // Arrange & Act
    renderModal();
    // Assert
    expect(
      screen.getByRole("button", { name: /Start Session/ }),
    ).toBeInTheDocument();
  });

  // ─── Close interactions ────────────────────────────────────────────────────

  it("calls onClose when the close button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal("JavaScript", jsCounts, onClose);
    // Act
    await user.click(screen.getByRole("button", { name: "Close" }));
    // Assert
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape key is pressed", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal("JavaScript", jsCounts, onClose);
    // Act
    await user.keyboard("{Escape}");
    // Assert
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    // Arrange
    const onClose = vi.fn();
    const { container } = renderModal("JavaScript", jsCounts, onClose);
    const backdrop = container.querySelector(".modal-backdrop") as HTMLElement;
    // Act — simulate clicking the backdrop element itself
    backdrop.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    // Assert
    expect(onClose).toHaveBeenCalledOnce();
  });

  // ─── Count selection ───────────────────────────────────────────────────────

  it("selects count=20 when the 20 pill is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act
    await user.click(screen.getByRole("button", { name: "20" }));
    // Assert — clicking Start Session routes with count=20
    await user.click(screen.getByRole("button", { name: /Start Session/ }));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("count=20"));
  });

  it("selects count=30 when the 30 pill is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act
    await user.click(screen.getByRole("button", { name: "30" }));
    await user.click(screen.getByRole("button", { name: /Start Session/ }));
    // Assert
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("count=30"));
  });

  // ─── Type filter selection ────────────────────────────────────────────────

  it('sets type filter to QUIZ_SIMPLE when "Multiple Choice" pill is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act
    await user.click(screen.getByRole("button", { name: /Multiple Choice/ }));
    await user.click(screen.getByRole("button", { name: /Start Session/ }));
    // Assert
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("type=QUIZ_SIMPLE"),
    );
  });

  it('sets type filter to TRUE_FALSE when "True / False" pill is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act
    await user.click(screen.getByRole("button", { name: /True \/ False/ }));
    await user.click(screen.getByRole("button", { name: /Start Session/ }));
    // Assert
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("type=TRUE_FALSE"),
    );
  });

  it("disables a type filter pill when that type has 0 questions", () => {
    // Arrange & Act — only QUIZ_SIMPLE has questions
    renderModal("JavaScript", {
      total: 10,
      QUIZ_SIMPLE: 10,
      TRUE_FALSE: 0,
      FILL_THE_BLANK: 0,
    });
    // Assert — True/False and Fill the Blank pills should be disabled
    expect(
      screen.getByRole("button", { name: /True \/ False/ }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Fill the Blank/ }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Multiple Choice/ }),
    ).not.toBeDisabled();
  });

  // ─── Cap warning ───────────────────────────────────────────────────────────

  it("shows a cap warning when selected count exceeds available questions", async () => {
    // Arrange — only 5 questions available; count defaults to 10 which exceeds it
    renderModal("JavaScript", {
      total: 5,
      QUIZ_SIMPLE: 5,
      TRUE_FALSE: 0,
      FILL_THE_BLANK: 0,
    });
    // Act — select count=10 (default) which exceeds the 5 available
    // count is already 10 by default; just check the warning
    // Assert
    await waitFor(() => {
      expect(
        screen.getByText(/Only 5 questions available — session capped at 5/),
      ).toBeInTheDocument();
    });
  });

  // ─── Disabled Start Session ────────────────────────────────────────────────

  it('disables "Start Session" when effectiveCount is 0 (no available questions)', () => {
    // Arrange & Act
    renderModal("Empty", zeroCounts);
    // Assert
    expect(
      screen.getByRole("button", { name: /Start Session/ }),
    ).toBeDisabled();
  });

  // ─── URL generation — normal mode ─────────────────────────────────────────

  it("builds the correct URL for default settings (count=10, type=mixed)", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal("JavaScript");
    // Act
    await user.click(screen.getByRole("button", { name: /Start Session/ }));
    // Assert
    expect(mockPush).toHaveBeenCalledWith(
      "/quiz/JavaScript?count=10&type=mixed",
    );
  });

  it("URL-encodes a topic name that contains spaces", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal("System Design");
    // Act
    await user.click(screen.getByRole("button", { name: /Start Session/ }));
    // Assert
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/quiz/System%20Design"),
    );
  });

  it("caps effectiveCount at available when count > available", async () => {
    // Arrange — 5 available, user keeps default count=10
    const user = userEvent.setup();
    renderModal("Small", {
      total: 5,
      QUIZ_SIMPLE: 5,
      TRUE_FALSE: 0,
      FILL_THE_BLANK: 0,
    });
    // Act
    await user.click(screen.getByRole("button", { name: /Start Session/ }));
    // Assert — count in URL must be 5 (capped), not 10
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("count=5"));
  });

  // ─── Remix mode ────────────────────────────────────────────────────────────

  const remixTopics: StudiedTopic[] = [
    {
      topic: "Database",
      counts: { total: 30, QUIZ_SIMPLE: 15, TRUE_FALSE: 10, FILL_THE_BLANK: 5 },
    },
    {
      topic: "Networking",
      counts: { total: 20, QUIZ_SIMPLE: 10, TRUE_FALSE: 5, FILL_THE_BLANK: 5 },
    },
  ];

  const remixStats: TypeCounts = {
    total: 50,
    QUIZ_SIMPLE: 25,
    TRUE_FALSE: 15,
    FILL_THE_BLANK: 10,
  };

  it("renders topic selector pills in Remix mode", () => {
    // Arrange & Act
    renderModal("Remix", remixStats, vi.fn(), remixTopics);
    // Assert — both topics appear as pills
    expect(
      screen.getByRole("button", { name: /Database/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Networking/ }),
    ).toBeInTheDocument();
  });

  it("includes selected topics in the URL for Remix mode", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal("Remix", remixStats, vi.fn(), remixTopics);
    // Act — all topics are selected by default
    await user.click(screen.getByRole("button", { name: /Start Session/ }));
    // Assert — URLSearchParams encodes commas as %2C; decode to verify readability
    const calledUrl: string = mockPush.mock.calls[0][0];
    expect(calledUrl).toContain("/quiz/Remix");
    // Decode to check the logical value (Database,Networking) regardless of encoding
    expect(decodeURIComponent(calledUrl)).toContain(
      "topics=Database,Networking",
    );
  });

  it("deselecting a topic removes it from the URL topics param", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal("Remix", remixStats, vi.fn(), remixTopics);
    // Act — deselect "Database"
    await user.click(screen.getByRole("button", { name: /Database/ }));
    await user.click(screen.getByRole("button", { name: /Start Session/ }));
    // Assert — only "Networking" in topics
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("topics=Networking"),
    );
    const calledWith: string = mockPush.mock.calls[0][0];
    expect(calledWith).not.toContain("Database");
  });

  it("reduces available count when a topic is deselected in Remix mode", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal("Remix", remixStats, vi.fn(), remixTopics);
    // Initial total = 50 (Database:30 + Networking:20)
    // After deselecting Database → Networking only: total=20
    // With count=30 selected → effectiveCount = min(30, 20) = 20
    await user.click(screen.getByRole("button", { name: "30" }));
    // Act — deselect Database
    await user.click(screen.getByRole("button", { name: /Database/ }));
    // Assert — cap warning appears (count 30 > available 20)
    await waitFor(() => {
      expect(
        screen.getByText(/Only 20 questions available — session capped at 20/),
      ).toBeInTheDocument();
    });
  });
});
