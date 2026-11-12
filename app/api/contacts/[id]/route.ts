import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdmin } from "@/lib/session";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.contact.delete({ where: { id } }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
