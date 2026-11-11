"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { DUMMY_SMS_HISTORY } from "@/lib/dummy-data";
import type { SmsStatus } from "@/types/sms";

const STATUS_TONE: Record<SmsStatus, "success" | "warning" | "danger"> = {
  Delivered: "success",
  Sent: "warning",
  Failed: "danger",
};

const PAGE_SIZE = 8;

export default function SmsHistoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return DUMMY_SMS_HISTORY;
    return DUMMY_SMS_HISTORY.filter(
      (item) =>
        item.recipient.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query),
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div>
      <PageHeader title="SMS History" description="A record of every message sent from this account." />

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search by recipient, message, or status..."
            icon={<Search size={16} />}
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </CardContent>

        <div className="overflow-x-auto border-t border-subtle">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-subtle text-secondary">
                <th className="px-5 py-3 font-medium">Recipient</th>
                <th className="px-5 py-3 font-medium">Message</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.map((item) => (
                <tr key={item.id} className="border-b border-subtle last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-primary">{item.recipient}</p>
                    <p className="text-xs text-secondary">{item.phone}</p>
                  </td>
                  <td className="max-w-sm px-5 py-3 text-secondary">{item.message}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-secondary">{item.date}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-secondary">
                    No messages match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={currentPage} pageSize={PAGE_SIZE} totalItems={filteredHistory.length} onPageChange={setPage} />
      </Card>
    </div>
  );
}
