import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_META, STATUS_ORDER } from "@/components/StatusBadge";
import type { Task, TaskStatus } from "@/lib/api";

export function TaskModal({
  open,
  task,
  saving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  task: Task | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { title: string; status: TaskStatus }) => void;
}) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setStatus((task?.status as TaskStatus) ?? "pending");
      setError("");
    }
  }, [open, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return setError("Task title is required.");
    if (trimmed.length > 200) return setError("Title must be under 200 characters.");
    onSubmit({ title: trimmed, status });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Create a new task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the title or move it to another status." : "Add something you need to get done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task title</Label>
            <Input
              id="task-title"
              value={title}
              maxLength={200}
              autoFocus
              placeholder="e.g. Finish the project report"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger id="task-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? (task ? "Updating..." : "Creating...") : task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
