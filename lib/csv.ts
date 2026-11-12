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

type Field = "name" | "phone" | "email" | "dateOfBirth" | "coinBalance" | "consent";

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
  consent: ["consent", "consentstatus"],
};

// Checked only when the header has no direct "name" column (see
// FIELD_ALIASES.name) — lets a CSV split across "First Name"/"Last Name"
// columns import too, combined into one name per row.
const FIRST_NAME_ALIASES = ["firstname", "fname", "givenname"];
const LAST_NAME_ALIASES = ["lastname", "lname", "surname", "familyname"];

const FIELD_ORDER: Field[] = ["name", "phone", "email", "dateOfBirth", "coinBalance", "consent"];

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
    const dateOfBirth = columns[columnIndexes.dateOfBirth] ?? "";
    const coinBalanceRaw = columns[columnIndexes.coinBalance] ?? "";
    const consentRaw = columns[columnIndexes.consent] ?? "";

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
