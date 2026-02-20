import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/registerRateLimit";

// Password rules enforced on both client and server (OWASP A07).
const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(32, "Username must be at most 32 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username may only contain letters, digits, and underscores.",
    ),
  email: z.string().trim().email("A valid email address is required.").max(254),
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
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // --- Rate limiting (OWASP A07 – Brute Force) ---
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? (forwarded.split(",")[0] ?? "unknown").trim()
    : "unknown";

  const rateResult = checkRateLimit(ip);
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateResult.retryAfterSeconds) },
      },
    );
  }

  // --- Parse body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Registration failed. Please check your input." },
      { status: 400 },
    );
  }

  // --- Validate input (OWASP A03 – Injection prevention via Zod + Prisma) ---
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    // Generic message — do not expose which field failed (OWASP A01 – enumeration prevention).
    return NextResponse.json(
      { error: "Registration failed. Please check your input." },
      { status: 400 },
    );
  }

  const { username, email, password } = parsed.data;

  // --- Hash password (OWASP A02 – bcrypt cost 12) ---
  const passwordHash = await bcrypt.hash(password, 12);

  // --- Persist user ---
  try {
    await prisma.user.create({
      data: { username, email, passwordHash },
    });
  } catch (err) {
    // Prisma unique constraint violation → P2002.
    // Return a generic message to prevent username/email enumeration (OWASP A01).
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Registration is currently unavailable. Please try again later.",
        },
        { status: 409 },
      );
    }
    // Do not leak internal error details to the client (OWASP A05).
    console.error("[register] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Account created." }, { status: 201 });
}
