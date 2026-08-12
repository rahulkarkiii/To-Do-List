import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTask,
  deleteTask,
  friendlyError,
  getTasks,
  updateTask,
  type Task,
  type TaskStatus,
} from "@/lib/api";

export const tasksKey = ["tasks"] as const;

export function useTasks(enabled = true) {
  return useQuery({
    queryKey: tasksKey,
    queryFn: getTasks,
    enabled,
    retry: 1,
  });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: tasksKey });

  const create = useMutation({
    mutationFn: (values: { title: string; status: TaskStatus }) => createTask(values),
    onSuccess: () => {
      toast.success("Task created successfully.");
      void invalidate();
    },
    onError: (e) => toast.error(friendlyError(e, "Task creation failed.")),
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: number | string; values: { title: string; status: TaskStatus } }) =>
      updateTask(id, values),
    onSuccess: () => {
      toast.success("Task updated successfully.");
      void invalidate();
    },
    onError: (e) => toast.error(friendlyError(e, "Task update failed.")),
  });

  const remove = useMutation({
    mutationFn: (id: number | string) => deleteTask(id),
    onSuccess: () => {
      toast.success("Task deleted.");
      void invalidate();
    },
    onError: (e) => toast.error(friendlyError(e, "Task deletion failed.")),
  });

  return { create, update, remove };
}

export function computeStats(tasks: Task[] = []) {
  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    complete: tasks.filter((t) => t.status === "complete").length,
  };
}
