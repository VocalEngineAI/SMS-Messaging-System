import twilio from "twilio";

// Lazily constructed — importing this module shouldn't throw just because
// Twilio isn't configured yet (e.g. local dev before env vars are set).
// Callers get a clear error from sendSms instead of a crash at import time.
let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  if (!client) client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client;
}

export function isTwilioConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

export type SendSmsResult = { ok: true; sid: string } | { ok: false; error: string };

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  const twilioClient = getClient();
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!twilioClient || !from) {
    return { ok: false, error: "Twilio is not configured (missing TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER)." };
  }

  try {
    const message = await twilioClient.messages.create({ to, from, body });
    return { ok: true, sid: message.sid };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown Twilio error";
    return { ok: false, error: reason };
  }
}
