import type { Contact } from "@/types/contact";

export type ParsedCsvRow = {
  name: string;
  phone: string;
  business: string;
  rowStatus: "valid" | "duplicate" | "invalid";
};

export type CsvImportResult = {
  rows: ParsedCsvRow[];
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  invalidCount: number;
};

const PHONE_PATTERN = /^[+()\d][\d\s().-]{6,}$/;

/*
 * Expects a simple "name,phone,business" header row followed by data rows.
 * This is a frontend-only simulation — no file is uploaded anywhere; it's
 * parsed entirely in the browser so the import preview has real rows to
 * show instead of static placeholders.
 */
export function parseContactsCsv(csvText: string, existingContacts: Contact[]): CsvImportResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const dataLines = lines.length > 0 && /name/i.test(lines[0]) && /phone/i.test(lines[0]) ? lines.slice(1) : lines;

  const existingPhones = new Set(existingContacts.map((c) => normalizePhone(c.phone)));
  const seenPhones = new Set<string>();
  const rows: ParsedCsvRow[] = [];

  for (const line of dataLines) {
    const columns = line.split(",").map((value) => value.trim());
    const [name = "", phone = "", business = ""] = columns;
    const normalizedPhone = normalizePhone(phone);

    let rowStatus: ParsedCsvRow["rowStatus"] = "valid";
    if (!name || !phone || !PHONE_PATTERN.test(phone)) {
      rowStatus = "invalid";
    } else if (existingPhones.has(normalizedPhone) || seenPhones.has(normalizedPhone)) {
      rowStatus = "duplicate";
    }

    seenPhones.add(normalizedPhone);
    rows.push({ name, phone, business, rowStatus });
  }

  const importedCount = rows.filter((r) => r.rowStatus === "valid").length;
  const duplicateCount = rows.filter((r) => r.rowStatus === "duplicate").length;
  const invalidCount = rows.filter((r) => r.rowStatus === "invalid").length;

  return { rows, totalRows: rows.length, importedCount, duplicateCount, invalidCount };
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
