import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export function ProjectsView() {
  return (
    <SectionPlaceholder
      title="Projects"
      description="Project spaces will group related tasks, notes, focus sessions, and progress."
      items={["Active projects", "Milestones", "Linked notes", "Progress"]}
    />
  );
}
