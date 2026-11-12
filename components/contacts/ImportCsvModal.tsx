"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { parseContactsCsv, type CsvImportResult, type ParsedCsvRow } from "@/lib/csv";
import { formatDateOfBirth } from "@/lib/date";
import type { Contact } from "@/types/contact";

const ROW_STATUS_TONE: Record<ParsedCsvRow["rowStatus"], "success" | "warning" | "danger"> = {
  valid: "success",
  duplicate: "warning",
  invalid: "danger",
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  existingContacts: Contact[];
  onImport: (csvText: string) => Promise<void>;
};

export function ImportCsvModal({ isOpen, onClose, existingContacts, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  function handleParse(text: string, name: string) {
    setFileName(name);
    setCsvText(text);
    setResult(parseContactsCsv(text, existingContacts));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleParse(String(reader.result ?? ""), file.name);
    reader.readAsText(file);
  }

  function handleClose() {
    setFileName(null);
    setCsvText(null);
    setResult(null);
    onClose();
  }

  async function handleConfirmImport() {
    if (!csvText) return;
    setIsImporting(true);
    await onImport(csvText);
    setIsImporting(false);
    handleClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Contacts"
      description="Upload a CSV file with columns: name, phone, email, date of birth, coinBalance, consent."
      widthClassName="max-w-3xl"
      footer={
        result && (
          <>
            <Button variant="outline" size="sm" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmImport}
              disabled={result.importedCount === 0 || isImporting}
              isLoading={isImporting}
              className="w-full sm:w-auto"
            >
              Confirm Import ({result.importedCount})
            </Button>
          </>
        )
      }
    >
      {!result ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-subtle bg-app px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink">
            <Upload size={22} />
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">Drag and drop a CSV file, or browse</p>
            <p className="mt-1 text-xs text-secondary">Expected columns: name, phone, email, date of birth, coinBalance, consent</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              Browse File
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-app px-4 py-3">
            <p className="text-sm text-secondary">
              Parsed <span className="font-semibold text-primary">{fileName}</span> — {result.totalRows} rows found
            </p>
            <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
              Choose another file
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-subtle p-3 text-center">
              <p className="text-xl font-bold text-primary">{result.importedCount}</p>
              <p className="text-xs text-secondary">Will import</p>
            </div>
            <div className="rounded-lg border border-subtle p-3 text-center">
              <p className="text-xl font-bold text-primary">{result.duplicateCount}</p>
              <p className="text-xs text-secondary">Duplicates</p>
            </div>
            <div className="rounded-lg border border-subtle p-3 text-center">
              <p className="text-xl font-bold text-primary">{result.invalidCount}</p>
              <p className="text-xs text-secondary">Invalid</p>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-lg border border-subtle">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-subtle bg-app text-secondary">
                  <th className="px-4 py-2 font-medium">#</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Phone</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Date of Birth</th>
                  <th className="px-4 py-2 font-medium">Coins</th>
                  <th className="px-4 py-2 font-medium">Consent</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, index) => (
                  <tr key={index} className="border-b border-subtle last:border-0">
                    <td className="px-4 py-2 text-secondary">{index + 1}</td>
                    <td className="px-4 py-2 text-primary">{row.name || "—"}</td>
                    <td className="px-4 py-2 text-secondary">{row.phone || "—"}</td>
                    <td className="px-4 py-2 text-secondary">{row.email || "—"}</td>
                    <td className="px-4 py-2 text-secondary">{row.dateOfBirth ? formatDateOfBirth(row.dateOfBirth) : "—"}</td>
                    <td className="px-4 py-2 text-secondary">{row.coinBalance}</td>
                    <td className="px-4 py-2 text-secondary">{row.consent}</td>
                    <td className="px-4 py-2">
                      <Badge tone={ROW_STATUS_TONE[row.rowStatus]}>{row.rowStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}
