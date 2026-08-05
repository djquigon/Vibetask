import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export function HabitsView() {
  return (
    <SectionPlaceholder
      title="Habits"
      description="Daily loops, streaks, and XP rewards that keep momentum visible."
      items={["Daily streaks", "Habit checklist", "XP rewards", "History"]}
    />
  );
}
