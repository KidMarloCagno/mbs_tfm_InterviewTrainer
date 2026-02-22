/**
 * Card primitive component tests — IMPORTANT TIER
 *
 * Strategy:
 * - Each of the 6 sub-components (Card, CardHeader, CardTitle, CardDescription,
 *   CardContent, CardFooter) must render with its designated CSS class.
 * - className merging must not drop the base class.
 * - Verify composed usage (realistic nesting) renders the full tree correctly.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Card primitives", () => {
  // ─── Individual sub-components ────────────────────────────────────────────

  it("Card renders with ui-card class", () => {
    // Arrange & Act
    render(<Card data-testid="card">Content</Card>);
    // Assert
    expect(screen.getByTestId("card")).toHaveClass("ui-card");
  });

  it("CardHeader renders with ui-card-header class", () => {
    // Arrange & Act
    render(<CardHeader data-testid="header">Header</CardHeader>);
    // Assert
    expect(screen.getByTestId("header")).toHaveClass("ui-card-header");
  });

  it("CardTitle renders with ui-card-title class", () => {
    // Arrange & Act
    render(<CardTitle data-testid="title">Title</CardTitle>);
    // Assert
    expect(screen.getByTestId("title")).toHaveClass("ui-card-title");
  });

  it("CardDescription renders with ui-card-description class", () => {
    // Arrange & Act
    render(<CardDescription data-testid="desc">Description</CardDescription>);
    // Assert
    expect(screen.getByTestId("desc")).toHaveClass("ui-card-description");
  });

  it("CardContent renders with ui-card-content class", () => {
    // Arrange & Act
    render(<CardContent data-testid="content">Content</CardContent>);
    // Assert
    expect(screen.getByTestId("content")).toHaveClass("ui-card-content");
  });

  it("CardFooter renders with ui-card-content class (aliased)", () => {
    // Arrange & Act
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    // Assert — CardFooter reuses ui-card-content intentionally
    expect(screen.getByTestId("footer")).toHaveClass("ui-card-content");
  });

  // ─── className merging ────────────────────────────────────────────────────

  it("merges custom className without dropping base class", () => {
    // Arrange & Act
    render(
      <Card className="extra" data-testid="card-extra">
        C
      </Card>,
    );
    const el = screen.getByTestId("card-extra");
    // Assert
    expect(el).toHaveClass("ui-card");
    expect(el).toHaveClass("extra");
  });

  it("renders without trailing space when no className is provided", () => {
    // Arrange & Act
    const { container } = render(<Card>Simple</Card>);
    const el = container.firstChild as HTMLElement;
    // Assert
    expect(el.className).toBe("ui-card");
  });

  // ─── Composition ──────────────────────────────────────────────────────────

  it("renders a fully composed card structure with all children visible", () => {
    // Arrange & Act
    render(
      <Card>
        <CardHeader>
          <CardTitle>Quick Quiz</CardTitle>
          <CardDescription>Test your recall</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Option A</p>
          <p>Option B</p>
        </CardContent>
        <CardFooter>
          <p>Footer note</p>
        </CardFooter>
      </Card>,
    );
    // Assert
    expect(screen.getByText("Quick Quiz")).toBeInTheDocument();
    expect(screen.getByText("Test your recall")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Footer note")).toBeInTheDocument();
  });
});
