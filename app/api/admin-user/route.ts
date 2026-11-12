import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdmin } from "@/lib/session";
import { isValidEmail } from "@/lib/validation";

export async function GET() {
  const sessionAdmin = await getSessionAdmin();
  if (!sessionAdmin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  return NextResponse.json({ id: sessionAdmin.id, name: sessionAdmin.name, email: sessionAdmin.email });
}

export async function PATCH(request: Request) {
  const sessionAdmin = await getSessionAdmin();
  if (!sessionAdmin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { name, email } = body ?? {};

  const data: { name?: string; email?: string } = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Enter a valid name." }, { status: 400 });
    }
    data.name = name.trim();
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    const normalizedEmail = email.trim();
    const existing = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
    if (existing && existing.id !== sessionAdmin.id) {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    }
    data.email = normalizedEmail;
  }

  const updated = await prisma.adminUser.update({ where: { id: sessionAdmin.id }, data });

  return NextResponse.json({ id: updated.id, name: updated.name, email: updated.email });
}
