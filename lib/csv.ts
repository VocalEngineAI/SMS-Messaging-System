import type { Contact, ConsentStatus } from "@/types/contact";

export type ParsedCsvRow = {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  coinBalance: number;
  consent: ConsentStatus;
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
const CONSENT_VALUES: ConsentStatus[] = ["Opted In", "Opted Out"];

/*
 * Expects a simple "name,phone,email,dateOfBirth,coinBalance,consent" header
 * row followed by data rows. This is a frontend-only simulation — no file
 * is uploaded anywhere; it's parsed entirely in the browser so the import
 * preview has real rows to show instead of static placeholders.
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
    const [name = "", phone = "", email = "", dateOfBirth = "", coinBalanceRaw = "", consentRaw = ""] = columns;
    const normalizedPhone = normalizePhone(phone);
    const coinBalance = Number(coinBalanceRaw) || 0;
    const consent = (CONSENT_VALUES.find((value) => value.toLowerCase() === consentRaw.toLowerCase()) ??
      "Opted Out") as ConsentStatus;

    let rowStatus: ParsedCsvRow["rowStatus"] = "valid";
    if (!name || !phone || !PHONE_PATTERN.test(phone)) {
      rowStatus = "invalid";
    } else if (existingPhones.has(normalizedPhone) || seenPhones.has(normalizedPhone)) {
      rowStatus = "duplicate";
    }

    seenPhones.add(normalizedPhone);
    rows.push({ name, phone, email, dateOfBirth, coinBalance, consent, rowStatus });
  }

  const importedCount = rows.filter((r) => r.rowStatus === "valid").length;
  const duplicateCount = rows.filter((r) => r.rowStatus === "duplicate").length;
  const invalidCount = rows.filter((r) => r.rowStatus === "invalid").length;

  return { rows, totalRows: rows.length, importedCount, duplicateCount, invalidCount };
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
