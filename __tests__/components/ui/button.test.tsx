/**
 * Button component tests — IMPORTANT TIER (80%+ coverage)
 *
 * Strategy:
 * - Verify every variant maps to the expected CSS class (variantMap logic).
 * - Verify size classes are applied / absent correctly.
 * - Verify native HTML attributes (disabled, type) are forwarded.
 * - Verify className merging doesn't drop base class.
 * - Verify click handlers fire and respect disabled state via userEvent (respects disabled).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  // ─── Rendering ───────────────────────────────────────────────────────────

  it("renders its children", () => {
    // Arrange & Act
    render(<Button>Save</Button>);
    // Assert
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("always includes the base ui-button class", () => {
    // Arrange & Act
    render(<Button>Base</Button>);
    // Assert
    expect(screen.getByRole("button")).toHaveClass("ui-button");
  });

  // ─── Variants ─────────────────────────────────────────────────────────────

  it.each([
    ["default", "ui-button-default"],
    ["destructive", "ui-button-destructive"],
    ["warning", "ui-button-warning"],
    ["outline", "ui-button-outline"],
    ["secondary", "ui-button-secondary"],
    ["ghost", "ui-button-secondary"], // ghost aliases secondary
    ["link", "ui-button-secondary"], // link aliases secondary
  ] as const)('variant "%s" → class "%s"', (variant, expectedClass) => {
    // Arrange & Act
    render(<Button variant={variant}>{variant}</Button>);
    // Assert
    expect(screen.getByRole("button")).toHaveClass(expectedClass);
  });

  it("falls back to ui-button-default when no variant is provided", () => {
    // Arrange & Act
    render(<Button>No variant</Button>);
    // Assert
    expect(screen.getByRole("button")).toHaveClass("ui-button-default");
  });

  // ─── Sizes ────────────────────────────────────────────────────────────────

  it('applies ui-button-lg when size is "lg"', () => {
    // Arrange & Act
    render(<Button size="lg">Large</Button>);
    // Assert
    expect(screen.getByRole("button")).toHaveClass("ui-button-lg");
  });

  it("does NOT apply ui-button-lg for default size", () => {
    // Arrange & Act
    render(<Button size="default">Default size</Button>);
    // Assert
    expect(screen.getByRole("button")).not.toHaveClass("ui-button-lg");
  });

  it('does NOT apply ui-button-lg for "sm" size', () => {
    // Arrange & Act
    render(<Button size="sm">Small</Button>);
    // Assert
    expect(screen.getByRole("button")).not.toHaveClass("ui-button-lg");
  });

  // ─── Prop forwarding ──────────────────────────────────────────────────────

  it("forwards the disabled prop", () => {
    // Arrange & Act
    render(<Button disabled>Disabled</Button>);
    // Assert
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it('forwards type="submit"', () => {
    // Arrange & Act
    render(<Button type="submit">Submit</Button>);
    // Assert
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("merges a custom className with the generated classes", () => {
    // Arrange & Act
    render(<Button className="extra-class">Custom</Button>);
    const btn = screen.getByRole("button");
    // Assert — both base class and custom class must be present
    expect(btn).toHaveClass("ui-button");
    expect(btn).toHaveClass("extra-class");
  });

  // ─── Interactions ─────────────────────────────────────────────────────────

  it("fires the onClick handler when clicked", async () => {
    // Arrange
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    // Act
    await user.click(screen.getByRole("button"));
    // Assert
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does NOT fire onClick when the button is disabled", async () => {
    // Arrange
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    // Act — userEvent respects disabled state and skips the click
    await user.click(screen.getByRole("button"));
    // Assert
    expect(onClick).not.toHaveBeenCalled();
  });
});
