/**
 * SignUpSection component tests — IMPORTANT TIER
 *
 * Strategy:
 * - SignUpSection is a thin orchestrator that renders a "Sign Up" button and
 *   conditionally renders SignUpModal based on local isModalOpen state.
 * - Mock SignUpModal to isolate SignUpSection logic from modal complexity.
 * - Test: prompt text visible, modal initially closed, opens on click, closes on onClose callback.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpSection } from "@/components/auth/SignUpSection";

// Lightweight mock — replaces SignUpModal with a controllable stub
vi.mock("@/components/auth/SignUpModal", () => ({
  SignUpModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label="Sign Up">
        <button type="button" onClick={onClose}>
          Close Modal
        </button>
      </div>
    ) : null,
}));

describe("SignUpSection", () => {
  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders the "New to QuizView?" prompt text', () => {
    // Arrange & Act
    render(<SignUpSection />);
    // Assert
    expect(screen.getByText("New to QuizView?")).toBeInTheDocument();
  });

  it("renders the Sign Up button", () => {
    // Arrange & Act
    render(<SignUpSection />);
    // Assert
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("does NOT show the modal by default", () => {
    // Arrange & Act
    render(<SignUpSection />);
    // Assert
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ─── Modal lifecycle ───────────────────────────────────────────────────────

  it("opens the SignUpModal when the Sign Up button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SignUpSection />);
    // Act
    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    // Assert
    expect(screen.getByRole("dialog", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("closes the modal when the modal triggers onClose", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SignUpSection />);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // Act — simulate the modal calling onClose
    await user.click(screen.getByRole("button", { name: "Close Modal" }));
    // Assert
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("can re-open the modal after it has been closed", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SignUpSection />);
    // Open → Close → Open
    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    await user.click(screen.getByRole("button", { name: "Close Modal" }));
    // Act
    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    // Assert
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
