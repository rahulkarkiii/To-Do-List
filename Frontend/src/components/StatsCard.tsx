import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
  loading,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "primary" | "warning" | "info" | "success";
  hint?: string;
  loading?: boolean;
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning-soft text-warning",
    info: "bg-info-soft text-info",
    success: "bg-success-soft text-success",
  } as const;
  const bars = {
    primary: "bg-primary",
    warning: "bg-warning",
    info: "bg-info",
    success: "bg-success",
  } as const;

  return (
    <div className="card-surface group p-5 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-14 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          )}
        </div>
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", bars[tone])}
          style={{ width: `${Math.min(100, value === 0 ? 4 : (hint ? Number(hint) : 100))}%` }}
        />
      </div>
    </div>
  );
}
