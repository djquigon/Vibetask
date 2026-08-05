import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export function NotesView() {
  return (
    <SectionPlaceholder
      title="Notes"
      description="Quick capture, organized thinking, and assistant-generated summaries."
      items={["Quick notes", "Project notes", "Brain dumps", "Summaries"]}
    />
  );
}
