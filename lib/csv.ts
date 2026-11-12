import type { Contact } from "@/types/contact";

export type ParsedCsvRow = {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  coinBalance: number;
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

function toIsoDate(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (year < 1000 || year > 9999) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Accepts whatever date-of-birth format a given CSV happens to use and
// normalizes it to "YYYY-MM-DD", or returns null if it's unparseable.
// Handles, in order:
//  - ISO date or timestamp ("1991-05-14", "1991-05-14T00:00:00Z") — read
//    directly off the string so a time/timezone suffix never shifts the date.
//  - "YYYY/MM/DD"
//  - Ambiguous numeric "D/M/Y" or "M/D/Y" (either "-" or "/"): if one segment
//    is >12 it must be the day, resolving the order; if both are <=12 (truly
//    ambiguous, e.g. "02/09/1988") this app defaults to day-first (D/M/Y),
//    matching the DD-MM-YYYY format used elsewhere in the UI.
//  - Anything else ("May 14, 1991", "14 May 1991", full JS-parsable strings)
//    via the native Date parser, reading the result back with local getters
//    (consistent with how the engine itself interpreted the local-time string).
function parseFlexibleDate(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (isoMatch) {
    const [, y, mo, d] = isoMatch;
    return toIsoDate(Number(y), Number(mo), Number(d));
  }

  const yearFirstSlash = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(value);
  if (yearFirstSlash) {
    const [, y, mo, d] = yearFirstSlash;
    return toIsoDate(Number(y), Number(mo), Number(d));
  }

  const yearLast = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(value);
  if (yearLast) {
    const [, a, b, y] = yearLast;
    const first = Number(a);
    const second = Number(b);
    const year = Number(y);
    if (first > 12 && second <= 12) return toIsoDate(year, second, first);
    if (second > 12 && first <= 12) return toIsoDate(year, first, second);
    if (first <= 12 && second <= 12) return toIsoDate(year, second, first); // ambiguous — assume day-first
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return toIsoDate(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
}

type Field = "name" | "phone" | "email" | "dateOfBirth" | "coinBalance";

// Accepted header spellings per field, matched case-insensitively with
// spaces/underscores/hyphens stripped (so "Date of Birth", "date_of_birth"
// and "dob" are all equivalent). The first entry is also each field's
// fallback column index — used only when the header doesn't name every
// field explicitly, keeping plain positional CSVs (no recognized aliases
// for a given column) working as before.
const FIELD_ALIASES: Record<Field, string[]> = {
  name: ["name", "fullname"],
  phone: ["phone", "phonenumber", "mobile", "mobilenumber"],
  email: ["email", "emailaddress"],
  dateOfBirth: ["dateofbirth", "dob", "birthday"],
  coinBalance: ["coinbalance", "coins", "balance"],
};

// Checked only when the header has no direct "name" column (see
// FIELD_ALIASES.name) — lets a CSV split across "First Name"/"Last Name"
// columns import too, combined into one name per row.
const FIRST_NAME_ALIASES = ["firstname", "fname", "givenname"];
const LAST_NAME_ALIASES = ["lastname", "lname", "surname", "familyname"];

const FIELD_ORDER: Field[] = ["name", "phone", "email", "dateOfBirth", "coinBalance"];

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[\s_-]/g, "");
}

type ColumnIndexes = Record<Field, number> & { firstName: number; lastName: number };

// Maps each field to the column index that holds it, by matching the header
// row's cells against FIELD_ALIASES. Any field the header doesn't name
// falls back to its default position (FIELD_ORDER), so a header missing a
// column we don't recognize doesn't break parsing — it just reads that
// field positionally. If there's no direct "name" column but there are
// "First Name"/"Last Name" columns, `name` is left at -1 and
// firstName/lastName are set instead — parseContactsCsv combines them.
function resolveColumnIndexes(headerCells: string[]): ColumnIndexes {
  const normalizedCells = headerCells.map(normalizeHeader);
  const indexes = {} as ColumnIndexes;

  for (const field of FIELD_ORDER) {
    const aliases = FIELD_ALIASES[field];
    const matchedIndex = normalizedCells.findIndex((cell) => aliases.includes(cell));
    indexes[field] = matchedIndex !== -1 ? matchedIndex : FIELD_ORDER.indexOf(field);
  }

  const firstNameIndex = normalizedCells.findIndex((cell) => FIRST_NAME_ALIASES.includes(cell));
  const lastNameIndex = normalizedCells.findIndex((cell) => LAST_NAME_ALIASES.includes(cell));
  const hasExplicitNameColumn = normalizedCells.some((cell) => FIELD_ALIASES.name.includes(cell));

  if (!hasExplicitNameColumn && (firstNameIndex !== -1 || lastNameIndex !== -1)) {
    indexes.name = -1;
  }
  indexes.firstName = firstNameIndex;
  indexes.lastName = lastNameIndex;

  return indexes;
}

/*
 * Expects a header row naming its columns (any order — matched by name, see
 * FIELD_ALIASES) followed by data rows. This is a frontend-only simulation —
 * no file is uploaded anywhere; it's parsed entirely in the browser so the
 * import preview has real rows to show instead of static placeholders.
 */
export function parseContactsCsv(csvText: string, existingContacts: Contact[]): CsvImportResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const hasHeaderRow = lines.length > 0 && /name/i.test(lines[0]) && /phone/i.test(lines[0]);
  const columnIndexes = hasHeaderRow
    ? resolveColumnIndexes(lines[0].split(",").map((cell) => cell.trim()))
    : resolveColumnIndexes([]);
  const dataLines = hasHeaderRow ? lines.slice(1) : lines;

  const existingPhones = new Set(existingContacts.map((c) => normalizePhone(c.phone)));
  const seenPhones = new Set<string>();
  const rows: ParsedCsvRow[] = [];

  for (const line of dataLines) {
    const columns = line.split(",").map((value) => value.trim());
    const name =
      columnIndexes.name !== -1
        ? columns[columnIndexes.name] ?? ""
        : [columns[columnIndexes.firstName], columns[columnIndexes.lastName]].filter(Boolean).join(" ");
    const phone = columns[columnIndexes.phone] ?? "";
    const email = columns[columnIndexes.email] ?? "";
    const dateOfBirthRaw = columns[columnIndexes.dateOfBirth] ?? "";
    const dateOfBirth = parseFlexibleDate(dateOfBirthRaw) ?? "";
    const coinBalanceRaw = columns[columnIndexes.coinBalance] ?? "";

    const normalizedPhone = normalizePhone(phone);
    const coinBalance = Number(coinBalanceRaw) || 0;

    // Only name and phone are required — email, date of birth, and coin
    // balance are all allowed to be blank (or, for date of birth,
    // unparseable — it's just dropped rather than blocking the row).
    let rowStatus: ParsedCsvRow["rowStatus"] = "valid";
    if (!name || !phone || !PHONE_PATTERN.test(phone)) {
      rowStatus = "invalid";
    } else if (existingPhones.has(normalizedPhone) || seenPhones.has(normalizedPhone)) {
      rowStatus = "duplicate";
    }

    seenPhones.add(normalizedPhone);
    rows.push({ name, phone, email, dateOfBirth, coinBalance, rowStatus });
  }

  const importedCount = rows.filter((r) => r.rowStatus === "valid").length;
  const duplicateCount = rows.filter((r) => r.rowStatus === "duplicate").length;
  const invalidCount = rows.filter((r) => r.rowStatus === "invalid").length;

  return { rows, totalRows: rows.length, importedCount, duplicateCount, invalidCount };
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
