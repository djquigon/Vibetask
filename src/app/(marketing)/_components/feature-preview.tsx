const features = [
  "Task capture",
  "Calendar planning",
  "Project rooms",
  "Notes",
  "Focus sessions",
  "XP and streaks",
  "Analytics",
  "AI voice mode",
];

export function FeaturePreview() {
  return (
    <section className="border-t border-vt-amber/15 bg-vt-background-quiet px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-2xl text-3xl font-black text-vt-text-strong">
          Built for the daily loop: capture, plan, focus, review.
        </h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-md border border-vt-amber/20 bg-vt-surface p-4 font-mono text-sm font-bold text-vt-text"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
