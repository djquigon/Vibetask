import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export function TasksView() {
  return (
    <SectionPlaceholder
      title="Tasks"
      description="A focused command center for capture, prioritization, status, and completion."
      items={["Inbox", "Today", "In progress", "Done"]}
    />
  );
}
