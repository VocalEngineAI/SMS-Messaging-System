import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
import { isValidEmail } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

// This is the only authentication gate on the app, so a limit here isn't
// about cost control — it's what stands between this endpoint and an
// unthrottled brute-force attempt. Keyed on both IP and the attempted email.
const LOGIN_RATE_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };

// Precomputed bcrypt hash of an arbitrary, unused placeholder password —
// compared against whenever no matching admin is found, so this route pays
// the same bcrypt cost regardless of whether the email exists (otherwise an
// attacker could enumerate valid emails by response time alone).
const DUMMY_PASSWORD_HASH = "$2b$12$qhdEieFdWj0xjI/LauHKde7jt34W1JIzOv.ktrXGbSWBg2KIJrzXO";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (typeof email !== "string" || typeof password !== "string" || !isValidEmail(email) || !password.trim()) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const ipLimit = checkRateLimit(`login:ip:${ip}`, LOGIN_RATE_LIMIT.max, LOGIN_RATE_LIMIT.windowMs);
  const emailLimit = checkRateLimit(`login:email:${email}`, LOGIN_RATE_LIMIT.max, LOGIN_RATE_LIMIT.windowMs);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    const retryAfterSeconds = Math.max(
      ipLimit.allowed ? 0 : ipLimit.retryAfterSeconds,
      emailLimit.allowed ? 0 : emailLimit.retryAfterSeconds,
    );
    return NextResponse.json(
      { error: "Too many login attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  // Always runs, real admin or not — see DUMMY_PASSWORD_HASH's comment.
  const passwordMatches = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!admin || !passwordMatches) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(admin.id);

  return NextResponse.json({ id: admin.id, name: admin.name, email: admin.email });
}
