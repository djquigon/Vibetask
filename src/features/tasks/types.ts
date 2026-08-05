export type TaskStatus = "todo" | "in_progress" | "done" | "overdue";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  userId: string;
};
