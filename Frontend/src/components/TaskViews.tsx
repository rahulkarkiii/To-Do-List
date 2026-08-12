import { Eye, Pencil, Trash2, MoveRight, Calendar } from "lucide-react";
import { STATUS_META, StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, TaskStatus } from "@/lib/api";
import { STATUS_ORDER } from "@/components/StatusBadge";

export function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

interface Actions {
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

function StatusMenu({ task, onStatusChange }: { task: Task } & Pick<Actions, "onStatusChange">) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change status">
          <MoveRight className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Change status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUS_ORDER.map((s) => (
          <DropdownMenuItem
            key={s}
            disabled={s === task.status}
            onClick={() => onStatusChange(task, s)}
          >
            <span className={`mr-2 h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
            {STATUS_META[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TaskCard({ task, ...actions }: { task: Task } & Actions) {
  return (
    <div className="card-surface flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{task.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatDate(task.created_at)} · #{task.id}
          </p>
        </div>
        <StatusBadge status={task.status} />
      </div>
      <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
        <StatusMenu task={task} onStatusChange={actions.onStatusChange} />
        <Button variant="ghost" size="icon" aria-label="View task" onClick={() => actions.onView(task)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit task" onClick={() => actions.onEdit(task)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete task"
          className="text-destructive hover:text-destructive"
          onClick={() => actions.onDelete(task)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function TaskTable({ tasks, ...actions }: { tasks: Task[] } & Actions) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">Task</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Created</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t border-border transition-colors hover:bg-muted/40">
                <td className="max-w-[320px] px-5 py-3">
                  <p className="truncate font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">#{task.id}</p>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-5 py-3 text-muted-foreground">{formatDate(task.created_at)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <StatusMenu task={task} onStatusChange={actions.onStatusChange} />
                    <Button variant="ghost" size="icon" aria-label="View task" onClick={() => actions.onView(task)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Edit task" onClick={() => actions.onEdit(task)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete task"
                      className="text-destructive hover:text-destructive"
                      onClick={() => actions.onDelete(task)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
