import { CheckCircle2, MessageSquareText, Users, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DASHBOARD_STATS, RECENT_ACTIVITY } from "@/lib/dummy-data";
import type { SmsStatus } from "@/types/sms";

const STATUS_TONE: Record<SmsStatus, "success" | "warning" | "danger"> = {
  Delivered: "success",
  Sent: "warning",
  Failed: "danger",
};

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your SMS campaigns and contact base." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Contacts" value={DASHBOARD_STATS.totalContacts} hint="Across all businesses" />
        <StatCard icon={MessageSquareText} label="Total SMS Sent" value={DASHBOARD_STATS.totalSmsSent} hint="All-time" />
        <StatCard icon={CheckCircle2} label="Delivered" value={DASHBOARD_STATS.delivered} hint="Successfully delivered" />
        <StatCard icon={XCircle} label="Failed" value={DASHBOARD_STATS.failed} hint="Needs attention" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent SMS Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-subtle text-secondary">
                  <th className="px-5 py-3 font-medium">Recipient</th>
                  <th className="px-5 py-3 font-medium">Message</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ACTIVITY.map((item) => (
                  <tr key={item.id} className="border-b border-subtle last:border-0">
                    <td className="px-5 py-3 font-medium text-primary">{item.recipient}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-secondary">{item.message}</td>
                    <td className="px-5 py-3 text-secondary">{item.date}</td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
