import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-zA-Z0-9_]+$/);

const emailSchema = z.string().trim().email().max(254);

// NOTE: This endpoint intentionally reveals whether a username/email is taken,
// which is a deliberate UX tradeoff for real-time availability feedback.
// The registration endpoint still uses generic errors (OWASP A01 enumeration prevention).
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const field = searchParams.get("field");
  const value = searchParams.get("value") ?? "";

  if (field === "username") {
    const parsed = usernameSchema.safeParse(value);
    if (!parsed.success) {
      // Value is malformed — don't query the DB; treat as unavailable.
      return NextResponse.json({ available: null });
    }
    const existing = await prisma.user.findUnique({
      where: { username: parsed.data },
      select: { id: true },
    });
    return NextResponse.json({ available: existing === null });
  }

  if (field === "email") {
    const parsed = emailSchema.safeParse(value);
    if (!parsed.success) {
      return NextResponse.json({ available: null });
    }
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data },
      select: { id: true },
    });
    return NextResponse.json({ available: existing === null });
  }

  return NextResponse.json({ error: "Invalid field." }, { status: 400 });
}
