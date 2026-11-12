const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\d][\d\s().-]{6,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value.trim());
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export const MIN_PASSWORD_LENGTH = 8;

export function isValidPassword(value: string): boolean {
  return value.trim().length >= MIN_PASSWORD_LENGTH;
}
