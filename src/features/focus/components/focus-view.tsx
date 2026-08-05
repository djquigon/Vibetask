import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export function FocusView() {
  return (
    <SectionPlaceholder
      title="Focus"
      description="Deep work sessions, Pomodoro-style timing, and focus history."
      items={["Start session", "Timers", "Session history", "Focus stats"]}
    />
  );
}
