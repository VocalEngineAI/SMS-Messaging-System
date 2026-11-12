import type { Contact as PrismaContact } from "@prisma/client";
import type { Contact, ConsentStatus } from "@/types/contact";

// Stored in the DB as a boolean (0/1) — see prisma/schema.prisma's
// Contact.consent comment. true = Opted In, false = Opted Out.
export function toConsentDbValue(consent: ConsentStatus): boolean {
  return consent === "Opted In";
}

export function toContactView(contact: PrismaContact): Contact {
  return {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    dateOfBirth: contact.dateOfBirth ? contact.dateOfBirth.toISOString().slice(0, 10) : "",
    coinBalance: contact.coinBalance,
    consent: contact.consent ? "Opted In" : "Opted Out",
  };
}
