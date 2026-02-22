/**
 * Progress component tests — IMPORTANT TIER
 *
 * Strategy:
 * - Verify the outer container gets ui-progress class.
 * - Verify the inner bar (.ui-progress-bar) width is set correctly via inline style.
 * - Edge cases: value=0 (default), value=100, value>100 (must cap at 100%).
 * - Verify className merging on the outer container.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "@/components/ui/progress";

/** Helper to retrieve the inner progress bar element */
function getBar(container: HTMLElement): HTMLElement {
  const bar = container.querySelector(".ui-progress-bar") as HTMLElement | null;
  if (!bar) throw new Error(".ui-progress-bar not found in container");
  return bar;
}

describe("Progress", () => {
  // ─── Rendering ────────────────────────────────────────────────────────────

  it("renders the outer container with ui-progress class", () => {
    // Arrange & Act
    render(<Progress data-testid="prog" />);
    // Assert
    expect(screen.getByTestId("prog")).toHaveClass("ui-progress");
  });

  it("renders the inner .ui-progress-bar element", () => {
    // Arrange & Act
    const { container } = render(<Progress />);
    // Assert
    expect(getBar(container)).toBeInTheDocument();
  });

  // ─── Width calculation ────────────────────────────────────────────────────

  it("defaults the bar to 0% width when no value is provided", () => {
    // Arrange & Act
    const { container } = render(<Progress />);
    // Assert
    expect(getBar(container).style.width).toBe("0%");
  });

  it("sets the bar width to the given percentage", () => {
    // Arrange & Act
    const { container } = render(<Progress value={75} />);
    // Assert
    expect(getBar(container).style.width).toBe("75%");
  });

  it("renders exactly 100% when value equals 100", () => {
    // Arrange & Act
    const { container } = render(<Progress value={100} />);
    // Assert
    expect(getBar(container).style.width).toBe("100%");
  });

  it("caps the bar at 100% when value exceeds 100", () => {
    // Arrange & Act — edge case: overshooting values (e.g. 150)
    const { container } = render(<Progress value={150} />);
    // Assert — Math.min(150, 100) = 100
    expect(getBar(container).style.width).toBe("100%");
  });

  it("renders 0% for value=0 (explicit zero)", () => {
    // Arrange & Act
    const { container } = render(<Progress value={0} />);
    // Assert
    expect(getBar(container).style.width).toBe("0%");
  });

  it("renders 50% for value=50", () => {
    // Arrange & Act
    const { container } = render(<Progress value={50} />);
    // Assert
    expect(getBar(container).style.width).toBe("50%");
  });

  // ─── Prop forwarding ──────────────────────────────────────────────────────

  it("merges a custom className on the outer container", () => {
    // Arrange & Act
    render(<Progress data-testid="prog-custom" className="my-progress" />);
    const outer = screen.getByTestId("prog-custom");
    // Assert
    expect(outer).toHaveClass("ui-progress");
    expect(outer).toHaveClass("my-progress");
  });

  it("forwards additional HTML attributes to the outer div", () => {
    // Arrange & Act
    render(<Progress data-testid="prog-attrs" aria-label="Quiz progress" />);
    // Assert
    expect(screen.getByTestId("prog-attrs")).toHaveAttribute(
      "aria-label",
      "Quiz progress",
    );
  });
});
