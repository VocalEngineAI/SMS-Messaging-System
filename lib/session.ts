import { cache } from "react";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import type { AdminUser } from "@prisma/client";

export const SESSION_COOKIE_NAME = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function createSession(adminUserId: string): Promise<void> {
  // The cookie value is this random token, never the row's own `id` — `id`
  // is a cuid (collision-avoidance, not adversarial unguessability); the
  // bearer credential needs real cryptographic randomness.
  const token = randomBytes(24).toString("hex");
  const session = await prisma.session.create({
    data: { adminUserId, token, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: session.expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => undefined);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Wrapped in cache() so multiple calls within the same request (e.g. the
// (app) layout's auth gate and a page under it both calling this) share one
// DB round trip instead of each re-querying Session+AdminUser.
export const getSessionAdmin = cache(async (): Promise<AdminUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { adminUser: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.adminUser;
});
