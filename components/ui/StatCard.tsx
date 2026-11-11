import type { ComponentType } from "react";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/Card";

type Props = {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ icon: Icon, label, value, hint }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5 text-ink")}>
            <Icon size={18} />
          </span>
          <span className="text-sm text-secondary">{label}</span>
        </div>
        <p className="stat-value mt-3 font-bold text-primary">{value}</p>
        {hint && <p className="mt-1 text-xs text-secondary">{hint}</p>}
      </CardContent>
    </Card>
  );
}
