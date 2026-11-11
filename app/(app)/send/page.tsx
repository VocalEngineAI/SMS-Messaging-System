"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Search, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DUMMY_CONTACTS } from "@/lib/dummy-data";
import type { ConsentStatus } from "@/types/contact";

const SMS_SEGMENT_LENGTH = 160;

const CONSENT_TONE: Record<ConsentStatus, "success" | "warning" | "danger"> = {
  "Opted In": "success",
  Pending: "warning",
  "Opted Out": "danger",
};

export default function SendSmsPage() {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<"sent" | "test" | null>(null);

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return DUMMY_CONTACTS;
    return DUMMY_CONTACTS.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        contact.business.toLowerCase().includes(query),
    );
  }, [search]);

  const allFilteredSelected = filteredContacts.length > 0 && filteredContacts.every((c) => selectedIds.has(c.id));
  const recipientCount = selectedIds.size;
  const charCount = message.length;
  const segmentCount = charCount === 0 ? 0 : Math.ceil(charCount / SMS_SEGMENT_LENGTH);

  function toggleContact(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allFilteredSelected) {
        filteredContacts.forEach((c) => next.delete(c.id));
      } else {
        filteredContacts.forEach((c) => next.add(c.id));
      }
      return next;
    });
  }

  function handleSendTest() {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendResult("test");
    }, 700);
  }

  function handleConfirmSend() {
    setIsConfirmOpen(false);
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendResult("sent");
      setSelectedIds(new Set());
      setMessage("");
    }, 1200);
  }

  const canSend = recipientCount > 0 && message.trim().length > 0;

  return (
    <div>
      <PageHeader title="Send SMS" description="Compose a message and send it to selected contacts." />

      {sendResult && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 size={16} />
          {sendResult === "test"
            ? "Test SMS simulated successfully (no real message was sent)."
            : `Message simulated to ${recipientCount || "selected"} recipient(s) successfully. This is placeholder behavior — no real SMS was sent.`}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Select Recipients</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4">
            <Input
              placeholder="Search contacts..."
              icon={<Search size={16} />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <label className="flex items-center gap-2.5 rounded-lg bg-app px-3.5 py-2.5 text-sm font-medium text-primary">
              <Checkbox checked={allFilteredSelected} onChange={toggleSelectAllFiltered} />
              Select all ({filteredContacts.length})
            </label>

            <div className="max-h-96 overflow-y-auto rounded-lg border border-subtle">
              {filteredContacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex items-center gap-3 border-b border-subtle px-4 py-3 last:border-0 hover:bg-app"
                >
                  <Checkbox checked={selectedIds.has(contact.id)} onChange={() => toggleContact(contact.id)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary">{contact.name}</p>
                    <p className="truncate text-xs text-secondary">
                      {contact.phone} · {contact.business}
                    </p>
                  </div>
                  <Badge tone={CONSENT_TONE[contact.consent]}>{contact.consent}</Badge>
                </label>
              ))}
              {filteredContacts.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-secondary">No contacts match your search.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>Keep it concise — longer messages use more SMS segments.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-4">
            <Textarea
              label="Message"
              placeholder="Write your SMS message here..."
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-secondary">
              <span>
                {charCount} characters · {segmentCount} SMS segment{segmentCount === 1 ? "" : "s"}
              </span>
              <span className="font-semibold text-primary">
                {recipientCount} recipient{recipientCount === 1 ? "" : "s"} selected
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSendTest}
                disabled={!message.trim() || isSending}
                isLoading={isSending && sendResult !== "sent"}
              >
                Send Test SMS
              </Button>
              <Button className="flex-1" onClick={() => setIsConfirmOpen(true)} disabled={!canSend || isSending}>
                <Send size={16} />
                Send SMS
              </Button>
            </div>
            <p className="text-xs text-secondary">
              Sending is simulated for this prototype — no messages are actually delivered.
            </p>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm send"
        widthClassName="max-w-md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsConfirmOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmSend} isLoading={isSending} className="w-full sm:w-auto">
              Confirm &amp; Send
            </Button>
          </>
        }
      >
        <p className="text-sm text-secondary">
          You&apos;re about to send this message to <span className="font-semibold text-primary">{recipientCount}</span>{" "}
          recipient{recipientCount === 1 ? "" : "s"}:
        </p>
        <p className="mt-3 rounded-lg bg-app p-3 text-sm text-primary">{message}</p>
      </Modal>
    </div>
  );
}
