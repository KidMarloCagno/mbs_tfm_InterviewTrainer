/**
 * LoginForm component tests — IMPORTANT TIER
 *
 * Strategy:
 * - Mock next/navigation (useRouter) and next-auth/react (signIn).
 * - Test initial render: username field, password field, submit button visible.
 * - Test Zod validation: empty submit shows both field-level errors, signIn is NOT called.
 * - Test happy path: valid credentials → signIn called with correct args → router.replace('/dashboard').
 * - Test error branches:
 *     · Generic error → "Invalid credentials."
 *     · TooManyAttempts error → rate-limit message.
 * - Test loading state: button text becomes "Signing in..." while awaiting signIn.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoginForm } from "@/components/auth/LoginForm";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

// ─── Shared fixtures ─────────────────────────────────────────────────────────

const mockReplace = vi.fn();

function buildRouter() {
  return {
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(buildRouter());
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────

  it("renders username field, password field and Sign In button", () => {
    // Arrange & Act
    render(<LoginForm />);
    // Assert
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it('password field has type="password" for security', () => {
    // Arrange & Act
    render(<LoginForm />);
    // Assert
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  // ─── Validation ────────────────────────────────────────────────────────────

  it("shows validation errors when both fields are empty on submit", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LoginForm />);
    // Act
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    // Assert
    await waitFor(() => {
      expect(screen.getByText("Username is required.")).toBeInTheDocument();
      expect(screen.getByText("Password is required.")).toBeInTheDocument();
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("does NOT call signIn when only username is filled", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Username"), "johndoe");
    // Act
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    // Assert
    await waitFor(() => {
      expect(screen.getByText("Password is required.")).toBeInTheDocument();
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  // ─── Happy path ────────────────────────────────────────────────────────────

  it('calls signIn with "credentials" provider and form values', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(signIn).mockResolvedValue({
      error: null,
      status: 200,
      ok: true,
      url: null,
    });
    render(<LoginForm />);
    // Act
    await user.type(screen.getByLabelText("Username"), "johndoe");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    // Assert
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        username: "johndoe",
        password: "secret123",
      });
    });
  });

  it("redirects to /dashboard after a successful sign-in", async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(signIn).mockResolvedValue({
      error: null,
      status: 200,
      ok: true,
      url: null,
    });
    render(<LoginForm />);
    // Act
    await user.type(screen.getByLabelText("Username"), "johndoe");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    // Assert
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  // ─── Error branches ────────────────────────────────────────────────────────

  it('shows "Invalid credentials." for a generic signIn error', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(signIn).mockResolvedValue({
      error: "CredentialsSignin",
      status: 401,
      ok: false,
      url: null,
    });
    render(<LoginForm />);
    // Act
    await user.type(screen.getByLabelText("Username"), "johndoe");
    await user.type(screen.getByLabelText("Password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid credentials.",
      );
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('shows rate-limit message when error is "TooManyAttempts"', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(signIn).mockResolvedValue({
      error: "TooManyAttempts",
      status: 429,
      ok: false,
      url: null,
    });
    render(<LoginForm />);
    // Act
    await user.type(screen.getByLabelText("Username"), "johndoe");
    await user.type(screen.getByLabelText("Password"), "anypassword");
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Too many sign-in attempts. Please wait 15 minutes before trying again.",
      );
    });
  });

  it("clears a previous form error when the user re-submits", async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(signIn)
      .mockResolvedValueOnce({
        error: "CredentialsSignin",
        status: 401,
        ok: false,
        url: null,
      })
      .mockResolvedValueOnce({ error: null, status: 200, ok: true, url: null });
    render(<LoginForm />);
    // Act — first failing attempt
    await user.type(screen.getByLabelText("Username"), "johndoe");
    await user.type(screen.getByLabelText("Password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    // Second successful attempt
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    // Assert — error must be gone after second call resolves
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  // ─── Loading state ─────────────────────────────────────────────────────────

  it('changes button label to "Signing in…" while submitting', async () => {
    // Arrange
    const user = userEvent.setup();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveSignIn!: (v: any) => void;
    vi.mocked(signIn).mockReturnValue(
      new Promise((res) => {
        resolveSignIn = res;
      }) as ReturnType<typeof signIn>,
    );
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Username"), "johndoe");
    await user.type(screen.getByLabelText("Password"), "secret123");
    // Act
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    // Assert — intermediate loading text
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Signing in..." }),
      ).toBeInTheDocument();
    });
    // Cleanup — resolve so no pending state leaks
    resolveSignIn({ error: null, status: 200, ok: true, url: null });
  });
});
