// Contacts store date of birth as "YYYY-MM-DD" (ISO); this renders that as
// "DD-MM-YYYY" for display. Date of birth is optional, so an empty string
// (no value) renders as empty; anything else that doesn't match the
// expected shape falls back to the raw string.
export function formatDateOfBirth(dateOfBirth: string): string {
  if (!dateOfBirth) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!match) return dateOfBirth;
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}
