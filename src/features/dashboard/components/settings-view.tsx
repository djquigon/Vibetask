import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export function SettingsView() {
  return (
    <SectionPlaceholder
      title="Settings"
      description="Account, voice, assistant, notification, and workspace preferences will live here."
      items={["Profile", "Voice mode", "Assistant behavior", "Integrations"]}
    />
  );
}
