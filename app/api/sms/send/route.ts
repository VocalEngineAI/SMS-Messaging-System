import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionAdmin } from "@/lib/session";
import { sendSms, isTwilioConfigured } from "@/lib/twilio";

export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const contactIds = body?.contactIds;
  const message = body?.message;

  if (!Array.isArray(contactIds) || contactIds.length === 0 || contactIds.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "contactIds must be a non-empty array of contact ids." }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }

  if (!isTwilioConfigured()) {
    return NextResponse.json(
      { error: "Twilio is not configured on the server (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER)." },
      { status: 503 },
    );
  }

  const contacts = await prisma.contact.findMany({ where: { id: { in: contactIds } } });

  const results = await Promise.all(
    contacts.map(async (contact) => {
      const result = await sendSms(contact.phone, message);
      await prisma.smsMessage.create({
        data: {
          contactId: contact.id,
          recipientName: contact.name,
          recipientPhone: contact.phone,
          body: message,
          status: result.ok ? "SENT" : "FAILED",
          providerRef: result.ok ? result.sid : result.error,
        },
      });
      return { contactId: contact.id, ok: result.ok };
    }),
  );

  const sentCount = results.filter((r) => r.ok).length;
  const failedCount = results.length - sentCount;

  return NextResponse.json({ sentCount, failedCount, total: results.length });
}
