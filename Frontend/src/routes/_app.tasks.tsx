import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TaskCard, TaskTable, formatDate } from "@/components/TaskViews";
import { EmptyState, TaskSkeleton } from "@/components/Feedback";
import { TaskModal } from "@/components/TaskModal";
import { DeleteModal } from "@/components/DeleteModal";
import { STATUS_META, STATUS_ORDER, StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskMutations, useTasks } from "@/hooks/useTasks";
import { friendlyError, type Task, type TaskStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | TaskStatus;
type SortKey = "newest" | "oldest" | "az" | "za";

export const Route = createFileRoute("/_app/tasks")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    status: (["all", ...STATUS_ORDER].includes(String(search["status"]))
      ? (search["status"] as StatusFilter)
      : "all") as StatusFilter,
    new: search["new"] === true || search["new"] === "true" ? true : undefined,
    view: search["view"] ? Number(search["view"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "My Tasks — TaskFlow" },
      { name: "description", content: "Search, filter, sort and manage every task in your workspace." },
      { property: "og:title", content: "My Tasks — TaskFlow" },
      { property: "og:description", content: "Search, filter, sort and manage every task in your workspace." },
    ],
  }),
  component: TasksPage,
});

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "complete", label: "Completed" },
];

function TasksPage() {
  const searchParams = Route.useSearch();
  const status: StatusFilter = searchParams.status ?? "all";
  const newParam = searchParams.new;
  const view = searchParams.view;
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useTasks();
  const { create, update, remove } = useTaskMutations();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [layout, setLayout] = useState<"grid" | "table">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const tasks = useMemo(() => data ?? [], [data]);
  const viewing = useMemo(() => tasks.find((t) => Number(t.id) === view) ?? null, [tasks, view]);

  useEffect(() => {
    if (newParam) {
      setEditing(null);
      setModalOpen(true);
      void navigate({ to: "/tasks", search: { status }, replace: true });
    }
  }, [newParam, navigate, status]);

  const setStatus = (next: StatusFilter) => void navigate({ to: "/tasks", search: { status: next } });
  const closeView = () => void navigate({ to: "/tasks", search: { status }, replace: true });

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = tasks.filter((t) => (status === "all" ? true : t.status === status));
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q));
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "za") return b.title.localeCompare(a.title);
      if (sort === "oldest") return Number(a.id) - Number(b.id);
      return Number(b.id) - Number(a.id);
    });
    return sorted;
  }, [tasks, status, search, sort]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };
  const actions = {
    onView: (task: Task) => void navigate({ to: "/tasks", search: { status, view: Number(task.id) } }),
    onEdit: openEdit,
    onDelete: (task: Task) => setDeleting(task),
    onStatusChange: (task: Task, next: TaskStatus) =>
      update.mutate({ id: task.id, values: { title: task.title, status: next } }),
  };

  return (
    <DashboardLayout
      title={status === "all" ? "All Tasks" : (STATUS_META[status]?.label ?? "Tasks")}
      subtitle={`${visible.length} task${visible.length === 1 ? "" : "s"}`}
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  status === f.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="za">Z-A</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden items-center rounded-lg border border-border bg-card p-1 sm:flex">
              <Button
                variant={layout === "grid" ? "secondary" : "ghost"}
                size="icon"
                aria-label="Grid view"
                onClick={() => setLayout("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === "table" ? "secondary" : "ghost"}
                size="icon"
                aria-label="Table view"
                onClick={() => setLayout("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>

        {isLoading ? (
          <TaskSkeleton />
        ) : isError ? (
          <div className="card-surface p-8 text-center">
            <p className="font-medium text-destructive">{friendlyError(error)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check that your API is running and reachable from this browser.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title={search || status !== "all" ? "No tasks found" : "No tasks yet"}
            description={
              search || status !== "all"
                ? "Try adjusting your search or filters."
                : "Start organizing your work by creating your first task."
            }
            actionLabel="Create Task"
            onAction={openCreate}
          />
        ) : layout === "table" ? (
          <TaskTable tasks={visible} {...actions} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((task) => (
              <TaskCard key={task.id} task={task} {...actions} />
            ))}
          </div>
        )}
      </div>

      <TaskModal
        open={modalOpen}
        task={editing}
        saving={create.isPending || update.isPending}
        onOpenChange={setModalOpen}
        onSubmit={(values) => {
          const action = editing
            ? update.mutateAsync({ id: editing.id, values })
            : create.mutateAsync(values);
          void action.then(() => setModalOpen(false)).catch(() => undefined);
        }}
      />

      <DeleteModal
        open={!!deleting}
        title={deleting?.title}
        deleting={remove.isPending}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          void remove
            .mutateAsync(deleting.id)
            .then(() => {
              setDeleting(null);
              if (viewing && viewing.id === deleting.id) closeView();
            })
            .catch(() => undefined);
        }}
      />

      <Dialog open={!!viewing} onOpenChange={(open) => !open && closeView()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="pr-6 break-words">{viewing?.title}</DialogTitle>
            <DialogDescription>Task details</DialogDescription>
          </DialogHeader>
          {viewing && (
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={viewing.status} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">{formatDate(viewing.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Task ID</dt>
                <dd className="font-medium">#{viewing.id}</dd>
              </div>
            </dl>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={closeView}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!viewing) return;
                closeView();
                openEdit(viewing);
              }}
            >
              Edit
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => viewing && setDeleting(viewing)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
