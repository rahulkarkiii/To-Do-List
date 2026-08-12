import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, ListTodo, Loader2, Plus, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { TaskCard } from "@/components/TaskViews";
import { EmptyState, TaskSkeleton } from "@/components/Feedback";
import { TaskModal } from "@/components/TaskModal";
import { DeleteModal } from "@/components/DeleteModal";
import { Button } from "@/components/ui/button";
import { computeStats, useTaskMutations, useTasks } from "@/hooks/useTasks";
import { friendlyError, type Task, type TaskStatus } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_app/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — TaskFlow" },
      { name: "description", content: "Your task overview: totals, pending, in progress and completed work." },
      { property: "og:title", content: "Dashboard — TaskFlow" },
      { property: "og:description", content: "Your task overview: totals, pending, in progress and completed work." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useTasks();
  const { create, update, remove } = useTaskMutations();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  const tasks = useMemo(() => data ?? [], [data]);
  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const pct = (n: number) => (stats.total ? Math.round((n / stats.total) * 100) : 0);

  const recent = useMemo(() => {
    const filtered = search.trim()
      ? tasks.filter((t) => t.title.toLowerCase().includes(search.trim().toLowerCase()))
      : tasks;
    return [...filtered].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 6);
  }, [tasks, search]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <DashboardLayout
      title={`Welcome back${user?.username ? `, ${user.username}` : ""}`}
      subtitle="Here's what's on your plate today."
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard label="Total Tasks" value={stats.total} icon={ListTodo} tone="primary" loading={isLoading} />
          <StatsCard label="Pending" value={stats.pending} icon={Clock} tone="warning" hint={String(pct(stats.pending))} loading={isLoading} />
          <StatsCard label="In Progress" value={stats.in_progress} icon={Loader2} tone="info" hint={String(pct(stats.in_progress))} loading={isLoading} />
          <StatsCard label="Completed" value={stats.complete} icon={CheckCircle2} tone="success" hint={String(pct(stats.complete))} loading={isLoading} />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="truncate text-lg font-semibold">Recent tasks</h2>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/tasks" search={{ status: "all" }}>
                View all <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>

        {isLoading ? (
          <TaskSkeleton count={3} />
        ) : isError ? (
          <div className="card-surface p-8 text-center">
            <p className="font-medium text-destructive">{friendlyError(error)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check that your API is running and reachable from this browser.
            </p>
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            title={search ? "No tasks found" : "No tasks yet"}
            description={
              search
                ? "Try a different search term."
                : "Start organizing your work by creating your first task."
            }
            actionLabel={search ? null : "Create Task"}
            onAction={openCreate}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recent.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onView={() => void navigate({ to: "/tasks", search: { status: "all", view: Number(task.id) } })}
                onEdit={(t) => {
                  setEditing(t);
                  setModalOpen(true);
                }}
                onDelete={setDeleting}
                onStatusChange={(t, status: TaskStatus) =>
                  update.mutate({ id: t.id, values: { title: t.title, status } })
                }
              />
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
          void remove.mutateAsync(deleting.id).then(() => setDeleting(null)).catch(() => undefined);
        }}
      />
    </DashboardLayout>
  );
}
