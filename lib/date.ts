// Contacts store date of birth as "YYYY-MM-DD" (ISO); this renders that as
// "DD-MM-YYYY" for display. Falls back to the raw string if it doesn't
// match the expected shape (e.g. an empty or malformed CSV value).
export function formatDateOfBirth(dateOfBirth: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!match) return dateOfBirth;
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}
