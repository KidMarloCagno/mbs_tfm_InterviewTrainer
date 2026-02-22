/**
 * ThemeSelect component tests — IMPORTANT TIER
 *
 * Strategy:
 * - jsdom provides localStorage; we clear it between tests.
 * - Render with no stored theme → defaults to 'neon'.
 * - Render with localStorage set to 'summer' → reads and applies 'summer'.
 * - Render with localStorage set to 'original' → applies 'original'.
 * - Render with an invalid stored value → falls back to 'neon'.
 * - After mount, document.documentElement.dataset.theme reflects the theme.
 * - Changing the select fires the onChange → updates dataset.theme and localStorage.
 * - The select has three options: Autumn (original), Neon, Summer.
 *
 * Note: Two useEffect hooks run on mount:
 *   1. Reads localStorage and sets state (runs once).
 *   2. Writes to localStorage + dataset whenever `theme` state changes.
 * RTL's `render` wraps in `act`, so both effects flush synchronously.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSelect } from "@/components/theme/ThemeSelect";

const STORAGE_KEY = "quizview-theme";

describe("ThemeSelect", () => {
  beforeEach(() => {
    // Clean slate for each test
    localStorage.clear();
    // Reset dataset
    delete document.documentElement.dataset.theme;
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders a "Theme" label', () => {
    // Arrange & Act
    render(<ThemeSelect />);
    // Assert
    expect(screen.getByLabelText("Theme")).toBeInTheDocument();
  });

  it("renders all three theme options", () => {
    // Arrange & Act
    render(<ThemeSelect />);
    // Assert
    expect(screen.getByRole("option", { name: "Autumn" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Neon" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Summer" })).toBeInTheDocument();
  });

  // ─── Initial theme from localStorage ─────────────────────────────────────

  it('defaults to "neon" when nothing is stored in localStorage', async () => {
    // Arrange — localStorage is empty (cleared in beforeEach)
    // Act
    render(<ThemeSelect />);
    // Assert — select value reflects "neon" and dataset is set
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveValue("neon");
    });
    expect(document.documentElement.dataset.theme).toBe("neon");
  });

  it('applies "summer" when stored in localStorage', async () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, "summer");
    // Act
    render(<ThemeSelect />);
    // Assert
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveValue("summer");
    });
    expect(document.documentElement.dataset.theme).toBe("summer");
  });

  it('applies "original" (Autumn) when stored in localStorage', async () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, "original");
    // Act
    render(<ThemeSelect />);
    // Assert
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveValue("original");
    });
    expect(document.documentElement.dataset.theme).toBe("original");
  });

  it('falls back to "neon" when an invalid value is in localStorage', async () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, "invalid-theme");
    // Act
    render(<ThemeSelect />);
    // Assert
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveValue("neon");
    });
  });

  // ─── Theme change interaction ─────────────────────────────────────────────

  it("updates localStorage when the user selects a different theme", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ThemeSelect />);
    await waitFor(() =>
      expect(screen.getByRole("combobox")).toHaveValue("neon"),
    );
    // Act — switch to Summer
    await user.selectOptions(screen.getByRole("combobox"), "summer");
    // Assert
    expect(localStorage.getItem(STORAGE_KEY)).toBe("summer");
  });

  it("updates document.documentElement.dataset.theme when the user changes the theme", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ThemeSelect />);
    await waitFor(() =>
      expect(screen.getByRole("combobox")).toHaveValue("neon"),
    );
    // Act
    await user.selectOptions(screen.getByRole("combobox"), "original");
    // Assert
    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("original");
    });
  });

  it("updates the select value when a new theme is chosen", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ThemeSelect />);
    // Act
    await user.selectOptions(screen.getByRole("combobox"), "summer");
    // Assert
    expect(screen.getByRole("combobox")).toHaveValue("summer");
  });

  it("persists the theme across a re-render (simulates page reload via localStorage)", async () => {
    // Arrange — set theme via interaction
    const user = userEvent.setup();
    const { unmount } = render(<ThemeSelect />);
    await user.selectOptions(screen.getByRole("combobox"), "summer");
    unmount();
    // Act — re-mount simulates returning to the page
    render(<ThemeSelect />);
    // Assert — reads 'summer' from localStorage
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveValue("summer");
    });
  });
});
