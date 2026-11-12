import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdmin } from "@/lib/session";

// Deletes every contact created by one CSV import (POST /api/contacts/import
// stamps all of a batch's rows with the same importBatchId) — the "Undo
// last import" action on the Contacts page.
export async function DELETE(_request: Request, { params }: { params: Promise<{ batchId: string }> }) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { batchId } = await params;
  const result = await prisma.contact.deleteMany({ where: { importBatchId: batchId } });

  return NextResponse.json({ deletedCount: result.count });
}
