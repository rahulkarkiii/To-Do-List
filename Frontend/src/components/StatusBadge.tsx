import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { TaskStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

export const STATUS_META: Record<
  TaskStatus,
  { label: string; icon: typeof Clock; badge: string; dot: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    badge: "bg-warning-soft text-warning border-warning/25",
    dot: "bg-warning",
  },
  in_progress: {
    label: "In Progress",
    icon: Loader2,
    badge: "bg-info-soft text-info border-info/25",
    dot: "bg-info",
  },
  complete: {
    label: "Completed",
    icon: CheckCircle2,
    badge: "bg-success-soft text-success border-success/25",
    dot: "bg-success",
  },
};

export const STATUS_ORDER: TaskStatus[] = ["pending", "in_progress", "complete"];

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        meta.badge,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}
