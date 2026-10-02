export type PlanItem = {
    taskId: string; start: string | null; end: string | null;
    title: string; estimate: { minutes: number; unknown: number };
    status: import('@/features/tasks/types').TaskStatus; archived: boolean;
};
export type DailyPlan = { id: string; date: string; timezone: string; budgetMinutes: number | null; items: PlanItem[]; revision: number };
export type PlanInput = { date: string; timezone: string; budgetMinutes: number | null; revision: number; items: Pick<PlanItem, 'taskId' | 'start' | 'end'>[] };
export type PlanningData = { timezone: string; today: string; plans: DailyPlan[] };
export type PlanningState = { status: 'success' | 'error'; message: string };
export type SplitChild = { id: string; title: string; description: string; estimatedMinutes: number };
