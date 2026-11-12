import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdmin } from "@/lib/session";
import { parseContactsCsv } from "@/lib/csv";
import { toContactView } from "@/lib/contact-mapper";

// Re-parses and re-validates the raw CSV text server-side against the
// current DB state — the browser's preview (ImportCsvModal) is UX only and
// is never trusted as the source of truth for what actually gets persisted.
export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const csvText = body?.csvText;
  if (typeof csvText !== "string" || !csvText.trim()) {
    return NextResponse.json({ error: "csvText is required." }, { status: 400 });
  }

  const existingContacts = await prisma.contact.findMany();
  const result = parseContactsCsv(csvText, existingContacts.map(toContactView));
  const validRows = result.rows.filter((row) => row.rowStatus === "valid");

  const importBatchId = randomUUID();

  const created = await prisma.contact.createMany({
    data: validRows.map((row) => ({
      name: row.name,
      phone: row.phone,
      email: row.email,
      dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
      coinBalance: row.coinBalance,
      importBatchId,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({
    importedCount: created.count,
    duplicateCount: result.duplicateCount,
    invalidCount: result.invalidCount,
    totalRows: result.totalRows,
    importBatchId: created.count > 0 ? importBatchId : null,
  });
}
