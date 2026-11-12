"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { parseContactsCsv, type CsvImportResult } from "@/lib/csv";
import type { Contact } from "@/types/contact";

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

  const duplicateNames = result?.rows.filter((row) => row.rowStatus === "duplicate").map((row) => row.name || row.phone || "—");
  const invalidNames = result?.rows.filter((row) => row.rowStatus === "invalid").map((row) => row.name || row.phone || "—");

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Contacts"
      description="Upload a CSV file with a header row naming: name, phone, email, date of birth, coins, consent (any column order). Only name and phone are required."
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
            <p className="mt-1 text-xs text-secondary">
              Header row columns (any order): name (or first/last name), phone, email, date of birth, coins, consent.
              Only name and phone are required — consent accepts Opted In/Out, Yes/No, or 1/0.
            </p>
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

          {duplicateNames && duplicateNames.length > 0 && (
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
              <p className="text-xs font-semibold text-warning">Duplicates (already exist, skipped)</p>
              <p className="mt-1 text-sm text-primary">{duplicateNames.join(", ")}</p>
            </div>
          )}

          {invalidNames && invalidNames.length > 0 && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-3">
              <p className="text-xs font-semibold text-danger">Invalid (missing or bad name/phone)</p>
              <p className="mt-1 text-sm text-primary">{invalidNames.join(", ")}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
