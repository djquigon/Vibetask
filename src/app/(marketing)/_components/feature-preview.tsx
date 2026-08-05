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
    <section className="border-t border-[#f5bf76]/15 bg-[#0a1713] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-2xl text-3xl font-black text-[#fff0c8]">
          Built for the daily loop: capture, plan, focus, review.
        </h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-md border border-[#f5bf76]/20 bg-[#0d1b17] p-4 font-mono text-sm font-bold text-[#f8e8c0]"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
