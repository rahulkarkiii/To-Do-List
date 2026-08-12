import { ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title = "No tasks yet",
  description = "Start organizing your work by creating your first task.",
  actionLabel = "Create Task",
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string | null;
  onAction?: () => void;
}) {
  return (
    <div className="card-surface flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <ListTodo className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function TaskSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="w-full space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
