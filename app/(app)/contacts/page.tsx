"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImportCsvModal } from "@/components/contacts/ImportCsvModal";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { formatBirthday } from "@/lib/date";
import type { Contact, ConsentStatus } from "@/types/contact";

const CONSENT_TONE: Record<ConsentStatus, "success" | "warning" | "danger"> = {
  "Opted In": "success",
  "Opted Out": "danger",
};

const PAGE_SIZE = 50;

export default function ContactsPage() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  async function loadContacts() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/contacts");
      if (!response.ok) throw new Error("Failed to load contacts");
      setContacts(await response.json());
    } catch {
      showToast("Failed to load contacts.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query),
    );
  }, [contacts, search]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  async function handleImport(csvText: string) {
    try {
      const response = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast(data?.error ?? "Import failed.", "error");
        return;
      }
      await loadContacts();
      setPage(1);
      if (data.importedCount > 0) {
        showToast(`Imported ${data.importedCount} contact${data.importedCount === 1 ? "" : "s"} successfully.`, "success");
      } else {
        showToast("No valid contacts were found to import.", "error");
      }
    } catch {
      showToast("Import failed. Please try again.", "error");
    }
  }

  async function handleConfirmDelete() {
    if (!contactToDelete) return;
    const deleted = contactToDelete;
    setContactToDelete(null);
    try {
      const response = await fetch(`/api/contacts/${deleted.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setContacts((current) => current.filter((c) => c.id !== deleted.id));
      showToast(`Deleted ${deleted.name}.`, "success");
    } catch {
      showToast(`Failed to delete ${deleted.name}.`, "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Manage your imported customer contact lists."
        action={
          <Button onClick={() => setIsImportOpen(true)}>
            <Upload size={16} />
            Import CSV
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search by name, phone, or email..."
            icon={<Search size={16} />}
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </CardContent>

        <div className="overflow-x-auto border-t border-subtle">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-subtle text-secondary">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Phone Number</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Birthday</th>
                <th className="px-5 py-3 font-medium">Coin Balance</th>
                <th className="px-5 py-3 font-medium">Consent Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.map((contact, index) => (
                <tr key={contact.id} className="border-b border-subtle last:border-0">
                  <td className="px-5 py-3 text-secondary">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="px-5 py-3 font-medium text-primary">{contact.name}</td>
                  <td className="px-5 py-3 text-secondary">{contact.phone}</td>
                  <td className="px-5 py-3 text-secondary">{contact.email}</td>
                  <td className="px-5 py-3 text-secondary">{formatBirthday(contact.birthday)}</td>
                  <td className="px-5 py-3 text-secondary">{contact.coinBalance}</td>
                  <td className="px-5 py-3">
                    <Badge tone={CONSENT_TONE[contact.consent]}>{contact.consent}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${contact.name}`}
                      onClick={() => setContactToDelete(contact)}
                      className="text-danger hover:bg-danger/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-secondary">
                    No contacts match your search.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-secondary">
                    Loading contacts…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={currentPage} pageSize={PAGE_SIZE} totalItems={filteredContacts.length} onPageChange={setPage} />
      </Card>

      <ImportCsvModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        existingContacts={contacts}
        onImport={handleImport}
      />

      {contactToDelete && (
        <ConfirmDialog
          title="Delete contact"
          description={`Are you sure you want to delete ${contactToDelete.name}? This cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={handleConfirmDelete}
          onCancel={() => setContactToDelete(null)}
        />
      )}
    </div>
  );
}
