type SectionPlaceholderProps = {
  title: string;
  description: string;
  items: string[];
};

export function SectionPlaceholder({
  title,
  description,
  items,
}: SectionPlaceholderProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-vt-amber/20 bg-vt-surface p-5">
        <p className="font-mono text-sm font-bold uppercase text-vt-green">
          Dashboard view
        </p>
        <h1 className="mt-3 font-mono text-4xl font-black uppercase text-vt-text-strong">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-vt-text-muted">
          {description}
        </p>
      </section>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-md border border-vt-border bg-vt-background p-4"
          >
            <p className="font-mono text-sm font-bold uppercase text-vt-primary">
              {item}
            </p>
            <p className="mt-3 text-sm text-vt-text-muted">
              Placeholder panel for the first implementation pass.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
