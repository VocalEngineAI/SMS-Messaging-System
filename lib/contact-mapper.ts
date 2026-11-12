import type { Contact as PrismaContact, ConsentStatus as PrismaConsentStatus } from "@prisma/client";
import type { Contact, ConsentStatus } from "@/types/contact";

const CONSENT_TO_VIEW: Record<PrismaConsentStatus, ConsentStatus> = {
  OPTED_IN: "Opted In",
  OPTED_OUT: "Opted Out",
};

const CONSENT_TO_DB: Record<ConsentStatus, PrismaConsentStatus> = {
  "Opted In": "OPTED_IN",
  "Opted Out": "OPTED_OUT",
};

export function toConsentDbValue(consent: ConsentStatus): PrismaConsentStatus {
  return CONSENT_TO_DB[consent];
}

export function toContactView(contact: PrismaContact): Contact {
  return {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    dateOfBirth: contact.dateOfBirth.toISOString().slice(0, 10),
    coinBalance: contact.coinBalance,
    consent: CONSENT_TO_VIEW[contact.consent],
  };
}
