/**
 * Badge component tests — IMPORTANT TIER
 *
 * Strategy:
 * - Badge is a thin wrapper div; verify the base class is always present.
 * - Verify className merging doesn't clobber ui-badge.
 * - Verify children render and arbitrary HTML attributes are forwarded.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders its children", () => {
    // Arrange & Act
    render(<Badge>Beginner</Badge>);
    // Assert
    expect(screen.getByText("Beginner")).toBeInTheDocument();
  });

  it("always has the ui-badge class", () => {
    // Arrange & Act
    render(<Badge>Test</Badge>);
    // Assert
    expect(screen.getByText("Test")).toHaveClass("ui-badge");
  });

  it("merges a custom className while keeping ui-badge", () => {
    // Arrange & Act
    render(<Badge className="custom-badge">Label</Badge>);
    const el = screen.getByText("Label");
    // Assert
    expect(el).toHaveClass("ui-badge");
    expect(el).toHaveClass("custom-badge");
  });

  it("renders without className when none is provided (no trailing space)", () => {
    // Arrange & Act
    const { container } = render(<Badge>Simple</Badge>);
    const el = container.firstChild as HTMLElement;
    // Assert — className should be exactly "ui-badge" (trimmed)
    expect(el.className).toBe("ui-badge");
  });

  it("forwards arbitrary HTML attributes (data-testid)", () => {
    // Arrange & Act
    render(<Badge data-testid="my-badge">Tag</Badge>);
    // Assert
    expect(screen.getByTestId("my-badge")).toBeInTheDocument();
  });

  it("renders as a div element", () => {
    // Arrange & Act
    const { container } = render(<Badge>Div</Badge>);
    // Assert
    expect(container.firstChild?.nodeName).toBe("DIV");
  });
});
