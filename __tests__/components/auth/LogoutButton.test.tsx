/**
 * LogoutButton component tests — IMPORTANT TIER
 *
 * Strategy:
 * - Mock next-auth/react (signOut) and window.confirm.
 * - Test that the button renders with the correct label.
 * - Test confirm=true branch: signOut called with callbackUrl='/'.
 * - Test confirm=false branch: signOut NOT called (user cancelled).
 * - Test the exact string passed to window.confirm.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signOut } from "next-auth/react";
import { LogoutButton } from "@/components/auth/LogoutButton";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("LogoutButton", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────

  it('renders a "Log out" button', () => {
    // Arrange & Act
    render(<LogoutButton />);
    // Assert
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });

  // ─── Confirm dialog — positive branch ─────────────────────────────────────

  it('calls signOut with callbackUrl="/" when user confirms the dialog', async () => {
    // Arrange
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<LogoutButton />);
    // Act
    await user.click(screen.getByRole("button", { name: "Log out" }));
    // Assert
    expect(signOut).toHaveBeenCalledOnce();
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });

  // ─── Confirm dialog — negative branch ─────────────────────────────────────

  it("does NOT call signOut when user cancels the dialog", async () => {
    // Arrange
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<LogoutButton />);
    // Act
    await user.click(screen.getByRole("button", { name: "Log out" }));
    // Assert
    expect(signOut).not.toHaveBeenCalled();
  });

  // ─── Dialog message ────────────────────────────────────────────────────────

  it("passes the correct message to window.confirm", async () => {
    // Arrange
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<LogoutButton />);
    // Act
    await user.click(screen.getByRole("button", { name: "Log out" }));
    // Assert
    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(confirmSpy).toHaveBeenCalledWith("Log out from QuizView?");
  });

  // ─── Multiple clicks ───────────────────────────────────────────────────────

  it("calls confirm each time the button is clicked", async () => {
    // Arrange
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<LogoutButton />);
    // Act
    await user.click(screen.getByRole("button", { name: "Log out" }));
    await user.click(screen.getByRole("button", { name: "Log out" }));
    // Assert
    expect(confirmSpy).toHaveBeenCalledTimes(2);
    expect(signOut).not.toHaveBeenCalled();
  });
});
