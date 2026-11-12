import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdmin } from "@/lib/session";
import { toContactView, toConsentDbValue } from "@/lib/contact-mapper";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import type { ConsentStatus } from "@/types/contact";

const CONSENT_VALUES: ConsentStatus[] = ["Opted In", "Opted Out"];

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(contacts.map(toContactView));
}

export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { name, phone, email, dateOfBirth, coinBalance, consent } = body ?? {};

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (typeof phone !== "string" || !isValidPhone(phone)) {
    return NextResponse.json({ error: "A valid phone number is required." }, { status: 400 });
  }
  // Only name and phone are required — email, date of birth, coin balance,
  // and consent are all optional and fall back to sensible defaults below.
  if (email !== undefined && email !== "" && (typeof email !== "string" || !isValidEmail(email))) {
    return NextResponse.json({ error: "Enter a valid email, or leave it blank." }, { status: 400 });
  }
  if (dateOfBirth !== undefined && dateOfBirth !== "" && (typeof dateOfBirth !== "string" || Number.isNaN(Date.parse(dateOfBirth)))) {
    return NextResponse.json({ error: "Enter a valid date of birth, or leave it blank." }, { status: 400 });
  }
  if (coinBalance !== undefined && (typeof coinBalance !== "number" || coinBalance < 0)) {
    return NextResponse.json({ error: "Coin balance must be a non-negative number." }, { status: 400 });
  }
  if (consent !== undefined && !CONSENT_VALUES.includes(consent as ConsentStatus)) {
    return NextResponse.json({ error: "Consent status must be 'Opted In' or 'Opted Out'." }, { status: 400 });
  }

  const existing = await prisma.contact.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "A contact with this phone number already exists." }, { status: 409 });
  }

  const contact = await prisma.contact.create({
    data: {
      name: name.trim(),
      phone,
      email: email || "",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      coinBalance: coinBalance ?? 0,
      consent: toConsentDbValue((consent as ConsentStatus) ?? "Opted Out"),
    },
  });

  return NextResponse.json(toContactView(contact), { status: 201 });
}
