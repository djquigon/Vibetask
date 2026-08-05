import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export function AnalyticsView() {
  return (
    <SectionPlaceholder
      title="Analytics"
      description="Reports for task completion, focus time, streaks, and work patterns."
      items={["Completion rate", "Focus time", "Project health", "AI reports"]}
    />
  );
}
