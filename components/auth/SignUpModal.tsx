"use client";

import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

// Mirror the server-side schema — Zod validates on both client and server (OWASP A07).
const signUpSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(32, "Username must be at most 32 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username may only contain letters, digits, and underscores.",
      ),
    email: z
      .string()
      .trim()
      .email("A valid email address is required.")
      .max(254),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .max(128, "Password is too long.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one digit.")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character.",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type AvailStatus = "idle" | "checking" | "available" | "taken";

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<AvailStatus>("idle");
  const [emailStatus, setEmailStatus] = useState<AvailStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const username = watch("username") ?? "";
  const password = watch("password") ?? "";
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const email = watch("email") ?? "";
  const atIndex = email.indexOf("@");
  const emailChecks = {
    hasAt: atIndex > 0,
    domain: atIndex > 0 && /\.[a-zA-Z]{2,}$/.test(email.slice(atIndex + 1)),
    noSpaces: email.length > 0 && !/\s/.test(email),
    noInject: email.length > 0 && !/[<>'";]/.test(email),
    maxLength: email.length > 0 && email.length <= 254,
  };

  // Debounced username availability check (400 ms).
  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(
        `/api/auth/check-availability?field=username&value=${encodeURIComponent(username)}`,
        { signal: controller.signal },
      )
        .then((r) => r.json())
        .then((data) => {
          const avail = (data as { available: boolean | null }).available;
          setUsernameStatus(
            avail === true ? "available" : avail === false ? "taken" : "idle",
          );
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setUsernameStatus("idle");
        });
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username]);

  // Debounced email availability check (400 ms).
  useEffect(() => {
    if (!email.includes("@")) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(
        `/api/auth/check-availability?field=email&value=${encodeURIComponent(email)}`,
        { signal: controller.signal },
      )
        .then((r) => r.json())
        .then((data) => {
          const avail = (data as { available: boolean | null }).available;
          setEmailStatus(
            avail === true ? "available" : avail === false ? "taken" : "idle",
          );
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setEmailStatus("idle");
        });
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [email]);

  // Close modal and reset all state.
  const handleClose = useCallback(() => {
    setFormError(null);
    setSuccessMessage(null);
    reset();
    onClose();
  }, [onClose, reset]);

  // Escape key handler.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Focus management: move focus into dialog on open and trap Tab inside.
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
    );

    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    dialog.addEventListener("keydown", handleTabKey);
    return () => {
      dialog.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen]);

  // Backdrop click: only close if the click target IS the backdrop itself.
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === backdropRef.current) {
      handleClose();
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // confirmPassword is client-only — never sent to the server.
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const json = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setFormError(json.error ?? "Registration failed. Please try again.");
        return;
      }

      // Success — show banner then auto-close.
      setSuccessMessage("Account created! You can now sign in.");
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch {
      setFormError("A network error occurred. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-modal-title"
        aria-describedby="signup-modal-desc"
        className="modal-panel"
      >
        <div className="modal-header">
          <h2 id="signup-modal-title" className="modal-title">
            Create Account
          </h2>
          <p id="signup-modal-desc" className="modal-description">
            Join QuizView and start your cyberpractice journey.
          </p>
          <button
            type="button"
            className="modal-close-button"
            onClick={handleClose}
            aria-label="Close sign-up dialog"
          >
            &#x2715;
          </button>
        </div>

        {successMessage ? (
          <p className="modal-success" role="status">
            {successMessage}
          </p>
        ) : (
          <form
            className="modal-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="modal-field">
              <label htmlFor="signup-username" className="modal-label">
                Username
              </label>
              <input
                id="signup-username"
                type="text"
                autoComplete="username"
                className="login-input"
                {...register("username")}
                aria-invalid={Boolean(errors.username)}
              />
              {errors.username ? (
                <p className="login-error modal-field-error">
                  {errors.username.message}
                </p>
              ) : null}
              {usernameStatus !== "idle" && !errors.username && (
                <p
                  className={`pw-check ${
                    usernameStatus === "available"
                      ? "pw-check-ok"
                      : usernameStatus === "taken"
                        ? "pw-check-fail"
                        : "field-avail-checking"
                  }`}
                  aria-live="polite"
                >
                  <span aria-hidden="true">
                    {usernameStatus === "available"
                      ? "✓"
                      : usernameStatus === "taken"
                        ? "✗"
                        : "…"}
                  </span>
                  {usernameStatus === "available"
                    ? "Username is available"
                    : usernameStatus === "taken"
                      ? "Username is already taken"
                      : "Checking availability…"}
                </p>
              )}
            </div>

            <div className="modal-field">
              <label htmlFor="signup-email" className="modal-label">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                className="login-input"
                {...register("email")}
                aria-invalid={Boolean(errors.email)}
              />
              {email.length > 0 && (
                <ul className="pw-checklist" aria-label="Email requirements">
                  {[
                    {
                      ok: emailChecks.hasAt,
                      label: "Contains @ with text before it",
                    },
                    {
                      ok: emailChecks.domain,
                      label: "Valid domain (e.g. gmail.com)",
                    },
                    { ok: emailChecks.noSpaces, label: "No spaces" },
                    {
                      ok: emailChecks.noInject,
                      label: "No special characters (<>\";')",
                    },
                    {
                      ok: emailChecks.maxLength,
                      label: "Max 254 characters (RFC 5321)",
                    },
                  ].map(({ ok, label }) => (
                    <li
                      key={label}
                      className={`pw-check ${ok ? "pw-check-ok" : "pw-check-fail"}`}
                    >
                      <span aria-hidden="true">{ok ? "✓" : "✗"}</span>
                      {label}
                    </li>
                  ))}
                </ul>
              )}
              {emailStatus !== "idle" && (
                <p
                  className={`pw-check ${
                    emailStatus === "available"
                      ? "pw-check-ok"
                      : emailStatus === "taken"
                        ? "pw-check-fail"
                        : "field-avail-checking"
                  }`}
                  aria-live="polite"
                >
                  <span aria-hidden="true">
                    {emailStatus === "available"
                      ? "✓"
                      : emailStatus === "taken"
                        ? "✗"
                        : "…"}
                  </span>
                  {emailStatus === "available"
                    ? "Email is available"
                    : emailStatus === "taken"
                      ? "Email is already registered"
                      : "Checking availability…"}
                </p>
              )}
            </div>

            <div className="modal-field">
              <label htmlFor="signup-password" className="modal-label">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                className="login-input"
                {...register("password")}
                aria-invalid={Boolean(errors.password)}
              />
              {password.length > 0 && (
                <ul className="pw-checklist" aria-label="Password requirements">
                  {[
                    { ok: checks.length, label: "At least 12 characters" },
                    {
                      ok: checks.uppercase,
                      label: "One uppercase letter (A–Z)",
                    },
                    {
                      ok: checks.lowercase,
                      label: "One lowercase letter (a–z)",
                    },
                    { ok: checks.digit, label: "One digit (0–9)" },
                    {
                      ok: checks.special,
                      label: "One special character (!@#…)",
                    },
                  ].map(({ ok, label }) => (
                    <li
                      key={label}
                      className={`pw-check ${ok ? "pw-check-ok" : "pw-check-fail"}`}
                    >
                      <span aria-hidden="true">{ok ? "✓" : "✗"}</span>
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="modal-field">
              <label htmlFor="signup-confirm-password" className="modal-label">
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                autoComplete="new-password"
                className="login-input"
                {...register("confirmPassword")}
                aria-invalid={Boolean(errors.confirmPassword)}
              />
              {errors.confirmPassword ? (
                <p className="login-error modal-field-error">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p className="login-error modal-form-error" role="alert">
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="login-button modal-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
