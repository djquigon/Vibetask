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

export type AssistantChatRequest = {
  message: string;
};

export type AssistantChatResponse = {
  message: string;
  assistantMessage: string;
  actions: [];
};

export type AssistantChatError = {
  message: string;
};
