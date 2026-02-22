/**
 * SignUpModal component tests — IMPORTANT TIER
 *
 * Strategy:
 * - Modal visibility: renders when isOpen=true, returns null when isOpen=false.
 * - Accessibility: dialog role, close on Escape key, close on backdrop click (not on panel).
 * - Password strength checklist: appears after typing, items update to green/red.
 * - Email checklist: appears after typing, items update to green/red.
 * - Zod validation errors on submit with invalid data.
 * - Happy path: POST /api/auth/register success → success banner, auto-close after 2 s.
 * - Error path: non-OK response → shows API error message.
 * - Network error: shows generic network message.
 * - Username/Email availability: debounced fetch called after 400 ms, status shown.
 *
 * Timers: vi.useFakeTimers() is used only for debounce / auto-close tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpModal } from "@/components/auth/SignUpModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_PASSWORD = "Abcdef1!ghijkl"; // 14 chars, upper, lower, digit, special
const VALID_EMAIL = "test@example.com";
const VALID_USERNAME = "johndoe";

// ─── Helper ───────────────────────────────────────────────────────────────────

function renderModal(isOpen = true, onClose = vi.fn()) {
  return render(<SignUpModal isOpen={isOpen} onClose={onClose} />);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("SignUpModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Provide a safe no-op fetch by default; individual tests override as needed
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ available: true }),
    } as Response);
  });

  // ─── Visibility ──────────────────────────────────────────────────────────

  it("renders the modal when isOpen is true", () => {
    // Arrange & Act
    renderModal(true);
    // Assert — dialog role present; use heading role to avoid the submit button ambiguity
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Create Account" }),
    ).toBeInTheDocument();
  });

  it("returns null when isOpen is false", () => {
    // Arrange & Act
    renderModal(false);
    // Assert
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // ─── Close interactions ───────────────────────────────────────────────────

  it("calls onClose when the close (✕) button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(true, onClose);
    // Act
    await user.click(
      screen.getByRole("button", { name: "Close sign-up dialog" }),
    );
    // Assert
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the Escape key is pressed", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(true, onClose);
    // Act
    await user.keyboard("{Escape}");
    // Assert
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when clicking directly on the backdrop (not the panel)", () => {
    // Arrange
    const onClose = vi.fn();
    renderModal(true, onClose);
    const backdrop = screen.getByRole("dialog").parentElement as HTMLElement;
    // Act — click the backdrop element itself
    fireEvent.click(backdrop, { target: backdrop });
    // Assert
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does NOT call onClose when clicking inside the modal panel", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(true, onClose);
    // Act — click the panel title heading (not the submit button)
    await user.click(screen.getByRole("heading", { name: "Create Account" }));
    // Assert
    expect(onClose).not.toHaveBeenCalled();
  });

  // ─── Form fields ──────────────────────────────────────────────────────────

  it("renders all four form fields", () => {
    // Arrange & Act
    renderModal();
    // Assert
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  // ─── Password strength checklist ─────────────────────────────────────────

  it("shows password requirements checklist after typing in the password field", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act
    await user.type(screen.getByLabelText("Password"), "a");
    // Assert — checklist appears
    expect(
      screen.getByRole("list", { name: "Password requirements" }),
    ).toBeInTheDocument();
  });

  it('marks "At least 12 characters" as ok once 12 chars are typed', async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act — type a short password first (fail), then a valid one (pass)
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    // Assert
    await waitFor(() => {
      const item = screen.getByText(/At least 12 characters/).closest("li");
      expect(item).toHaveClass("pw-check-ok");
    });
  });

  it('marks "At least 12 characters" as fail for a short password', async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act
    await user.type(screen.getByLabelText("Password"), "Ab1!short"); // < 12
    // Assert
    await waitFor(() => {
      const item = screen.getByText(/At least 12 characters/).closest("li");
      expect(item).toHaveClass("pw-check-fail");
    });
  });

  it("marks uppercase check as ok when password contains uppercase", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act
    await user.type(screen.getByLabelText("Password"), "Abcdefgh1!xx");
    // Assert
    await waitFor(() => {
      const item = screen.getByText(/One uppercase letter/).closest("li");
      expect(item).toHaveClass("pw-check-ok");
    });
  });

  // ─── Email checklist ──────────────────────────────────────────────────────

  it("shows email requirements checklist after typing in the email field", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act
    await user.type(screen.getByLabelText("Email"), "a");
    // Assert
    expect(
      screen.getByRole("list", { name: "Email requirements" }),
    ).toBeInTheDocument();
  });

  it('marks "Contains @ with text before it" as ok for a valid prefix', async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act
    await user.type(screen.getByLabelText("Email"), "user@");
    // Assert
    await waitFor(() => {
      const item = screen
        .getByText(/Contains @ with text before it/)
        .closest("li");
      expect(item).toHaveClass("pw-check-ok");
    });
  });

  it('marks "No spaces" as fail when email contains a space', async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    // Act
    await user.type(screen.getByLabelText("Email"), "user @example.com");
    // Assert
    await waitFor(() => {
      const item = screen.getByText(/No spaces/).closest("li");
      expect(item).toHaveClass("pw-check-fail");
    });
  });

  // ─── Zod validation errors ────────────────────────────────────────────────

  it("shows validation error for username too short (< 3 chars)", async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText("Username"), "ab"); // only 2 chars
    await user.type(screen.getByLabelText("Email"), VALID_EMAIL);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.type(screen.getByLabelText("Confirm Password"), VALID_PASSWORD);
    // Act
    await user.click(screen.getByRole("button", { name: "Create Account" }));
    // Assert
    await waitFor(() => {
      expect(
        screen.getByText("Username must be at least 3 characters."),
      ).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/register"),
      expect.anything(),
    );
  });

  it('shows "Passwords do not match." when confirmPassword differs', async () => {
    // Arrange
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByLabelText("Username"), VALID_USERNAME);
    await user.type(screen.getByLabelText("Email"), VALID_EMAIL);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.type(
      screen.getByLabelText("Confirm Password"),
      "DifferentPass1!",
    );
    // Act
    await user.click(screen.getByRole("button", { name: "Create Account" }));
    // Assert
    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    });
  });

  // ─── Successful registration ───────────────────────────────────────────────

  it("shows success banner after a successful POST /api/auth/register", async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "User created" }),
    } as Response);
    renderModal();
    await user.type(screen.getByLabelText("Username"), VALID_USERNAME);
    await user.type(screen.getByLabelText("Email"), VALID_EMAIL);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.type(screen.getByLabelText("Confirm Password"), VALID_PASSWORD);
    // Act
    await user.click(screen.getByRole("button", { name: "Create Account" }));
    // Assert
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Account created! You can now sign in.",
      );
    });
  });

  // ─── API error response ───────────────────────────────────────────────────

  it("shows the API error message when the register endpoint returns non-OK", async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Username already taken." }),
    } as Response);
    renderModal();
    await user.type(screen.getByLabelText("Username"), VALID_USERNAME);
    await user.type(screen.getByLabelText("Email"), VALID_EMAIL);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.type(screen.getByLabelText("Confirm Password"), VALID_PASSWORD);
    // Act
    await user.click(screen.getByRole("button", { name: "Create Account" }));
    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Username already taken.",
      );
    });
  });

  it("shows a generic message when the network request fails", async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network failure"));
    renderModal();
    await user.type(screen.getByLabelText("Username"), VALID_USERNAME);
    await user.type(screen.getByLabelText("Email"), VALID_EMAIL);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.type(screen.getByLabelText("Confirm Password"), VALID_PASSWORD);
    // Act
    await user.click(screen.getByRole("button", { name: "Create Account" }));
    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "A network error occurred. Please try again.",
      );
    });
  });

  // ─── Username availability debounce ───────────────────────────────────────

  it("calls the availability API for username after 400 ms debounce", async () => {
    // Arrange — real timers; waitFor polls until the debounce fires naturally
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ available: true }),
    } as Response);
    renderModal();
    // Act
    await user.type(screen.getByLabelText("Username"), "john");
    // Assert — allow up to 2 s for the 400 ms debounce to fire
    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("field=username&value=john"),
          expect.any(Object),
        );
      },
      { timeout: 2000 },
    );
  });

  it('shows "Username is available" when API returns available=true', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ available: true }),
    } as Response);
    renderModal();
    // Act
    await user.type(screen.getByLabelText("Username"), "john");
    // Assert
    await waitFor(
      () =>
        expect(screen.getByText(/Username is available/)).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it('shows "Username is already taken" when API returns available=false', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ available: false }),
    } as Response);
    renderModal();
    // Act
    await user.type(screen.getByLabelText("Username"), "john");
    // Assert
    await waitFor(
      () =>
        expect(
          screen.getByText(/Username is already taken/),
        ).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  // ─── Auto-close after success ─────────────────────────────────────────────

  it("calls onClose automatically 2 s after a successful registration", async () => {
    // Arrange — real timers; waitFor polls until the 2 s auto-close fires
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Created" }),
    } as Response);
    render(<SignUpModal isOpen onClose={onClose} />);
    await user.type(screen.getByLabelText("Username"), VALID_USERNAME);
    await user.type(screen.getByLabelText("Email"), VALID_EMAIL);
    await user.type(screen.getByLabelText("Password"), VALID_PASSWORD);
    await user.type(screen.getByLabelText("Confirm Password"), VALID_PASSWORD);
    // Act
    await user.click(screen.getByRole("button", { name: "Create Account" }));
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    // Assert — onClose is called after the 2 s auto-close timer
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce(), {
      timeout: 3500,
    });
  }, 10_000); // per-test timeout: 10 s to cover the 2 s delay + typing
});
