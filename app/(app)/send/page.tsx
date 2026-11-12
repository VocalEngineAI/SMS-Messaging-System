"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Contact, ConsentStatus } from "@/types/contact";

const SMS_SEGMENT_LENGTH = 160;

const CONSENT_TONE: Record<ConsentStatus, "success" | "warning" | "danger"> = {
  "Opted In": "success",
  "Opted Out": "danger",
};

const CONSENT_FILTER_OPTIONS: Array<ConsentStatus | "All"> = ["All", "Opted In", "Opted Out"];

export default function SendSmsPage() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [consentFilter, setConsentFilter] = useState<ConsentStatus | "All">("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetch("/api/contacts")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setContacts)
      .catch(() => showToast("Failed to load contacts.", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesQuery =
        !query ||
        contact.name.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query);
      const matchesConsent = consentFilter === "All" || contact.consent === consentFilter;
      return matchesQuery && matchesConsent;
    });
  }, [search, consentFilter]);

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

  async function handleConfirmSend() {
    setIsConfirmOpen(false);
    setIsSending(true);
    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: Array.from(selectedIds), message }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast(data?.error ?? "Failed to send messages.", "error");
        return;
      }
      if (data.failedCount > 0) {
        showToast(`Sent to ${data.sentCount} recipient(s); ${data.failedCount} failed.`, "error");
      } else {
        showToast(`Sent to ${data.sentCount} recipient(s) successfully.`, "success");
      }
      setSelectedIds(new Set());
      setMessage("");
    } catch {
      showToast("Failed to send messages. Please try again.", "error");
    } finally {
      setIsSending(false);
    }
  }

  const canSend = recipientCount > 0 && message.trim().length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Send SMS" description="Compose a message and send it to selected contacts." />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="min-h-0 lg:col-span-3">
          <CardHeader>
            <CardTitle>Select Recipients</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="min-w-[160px] flex-1">
                <Input
                  placeholder="Search contacts..."
                  icon={<Search size={16} />}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <Select
                value={consentFilter}
                onChange={(event) => setConsentFilter(event.target.value as ConsentStatus | "All")}
                className="sm:w-44"
                aria-label="Filter by consent status"
              >
                {CONSENT_FILTER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "All" ? "Consent Status" : option}
                  </option>
                ))}
              </Select>
            </div>

            <label className="flex shrink-0 items-center gap-2.5 rounded-lg bg-app px-3.5 py-2.5 text-sm font-medium text-primary">
              <Checkbox checked={allFilteredSelected} onChange={toggleSelectAllFiltered} />
              Select all ({filteredContacts.length})
            </label>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-subtle">
              {filteredContacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex items-center gap-3 border-b border-subtle px-4 py-3 last:border-0 hover:bg-app"
                >
                  <Checkbox checked={selectedIds.has(contact.id)} onChange={() => toggleContact(contact.id)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary">{contact.name}</p>
                    <p className="truncate text-xs text-secondary">
                      {contact.phone} · {contact.email}
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

        <Card className="min-h-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">
            <Textarea
              label="Message"
              placeholder="Write your SMS message here..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              containerClassName="min-h-0 flex-1"
              className="h-full"
            />

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs text-secondary">
              <span>
                {charCount} characters · {segmentCount} SMS segment{segmentCount === 1 ? "" : "s"}
              </span>
              <span className="font-semibold text-primary">
                {recipientCount} recipient{recipientCount === 1 ? "" : "s"} selected
              </span>
            </div>

            <Button size="sm" className="w-full shrink-0" onClick={() => setIsConfirmOpen(true)} disabled={!canSend || isSending}>
              <Send size={16} />
              Send SMS
            </Button>
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
