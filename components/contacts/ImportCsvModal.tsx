"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { parseContactsCsv, type CsvImportResult, type ParsedCsvRow } from "@/lib/csv";
import type { Contact } from "@/types/contact";

const SAMPLE_CSV = `name,phone,business
Grace Kelly,+1 (415) 555-0211,The Coffee Hub
Daniel Wu,+1 (650) 555-0144,Walker Fitness Studio
Olivia Bennett,+1 (415) 555-0132,The Coffee Hub
not-a-phone,abc,Unknown Co.
Priya Shah,+1 (510) 555-0298,Chen & Co. Salon`;

const ROW_STATUS_TONE: Record<ParsedCsvRow["rowStatus"], "success" | "warning" | "danger"> = {
  valid: "success",
  duplicate: "warning",
  invalid: "danger",
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  existingContacts: Contact[];
  onImport: (rows: ParsedCsvRow[]) => void;
};

export function ImportCsvModal({ isOpen, onClose, existingContacts, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);

  function handleParse(text: string, name: string) {
    setFileName(name);
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
    setResult(null);
    onClose();
  }

  function handleConfirmImport() {
    if (!result) return;
    onImport(result.rows);
    handleClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Contacts"
      description="Upload a CSV file with columns: name, phone, business."
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
              disabled={result.importedCount === 0}
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
            <p className="mt-1 text-xs text-secondary">Expected columns: name, phone, business</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              Browse File
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleParse(SAMPLE_CSV, "sample-contacts.csv")}>
              <FileSpreadsheet size={16} />
              Use sample CSV
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
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Phone</th>
                  <th className="px-4 py-2 font-medium">Business</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, index) => (
                  <tr key={index} className="border-b border-subtle last:border-0">
                    <td className="px-4 py-2 text-primary">{row.name || "—"}</td>
                    <td className="px-4 py-2 text-secondary">{row.phone || "—"}</td>
                    <td className="px-4 py-2 text-secondary">{row.business || "—"}</td>
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
