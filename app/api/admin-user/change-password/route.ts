import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSessionAdmin } from "@/lib/session";
import { isValidPassword, MIN_PASSWORD_LENGTH } from "@/lib/validation";

export async function POST(request: Request) {
  const sessionAdmin = await getSessionAdmin();
  if (!sessionAdmin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;

  if (typeof currentPassword !== "string" || !currentPassword.trim()) {
    return NextResponse.json({ error: "Current password is required." }, { status: 400 });
  }
  if (typeof newPassword !== "string" || !isValidPassword(newPassword)) {
    return NextResponse.json(
      { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const matches = await bcrypt.compare(currentPassword, sessionAdmin.passwordHash);
  if (!matches) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.adminUser.update({ where: { id: sessionAdmin.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
