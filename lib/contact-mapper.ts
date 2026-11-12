import type { Contact as PrismaContact } from "@prisma/client";
import type { Contact } from "@/types/contact";

export function toContactView(contact: PrismaContact): Contact {
  return {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    dateOfBirth: contact.dateOfBirth ? contact.dateOfBirth.toISOString().slice(0, 10) : "",
    coinBalance: contact.coinBalance,
  };
}
