import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export function CalendarView() {
  return (
    <SectionPlaceholder
      title="Calendar"
      description="A planning view for schedule blocks, deadlines, assistant plans, and focus time."
      items={["Today", "Week", "Focus blocks", "Assistant drafts"]}
    />
  );
}
