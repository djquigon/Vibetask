export type AssistantMode = "text" | "voice";

export type AssistantActionType =
  | "create_task"
  | "create_calendar_event"
  | "create_note"
  | "generate_report";

export type AssistantAction = {
  type: AssistantActionType;
  summary: string;
  requiresConfirmation: boolean;
};
