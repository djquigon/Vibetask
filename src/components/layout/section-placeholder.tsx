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
      <section className="rounded-md border border-[#f5bf76]/20 bg-[#0d1b17] p-5">
        <p className="font-mono text-sm font-bold uppercase text-[#50d678]">
          Dashboard view
        </p>
        <h1 className="mt-3 font-mono text-4xl font-black uppercase text-[#fff0c8]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d8c79f]">
          {description}
        </p>
      </section>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-md border border-[#25392f] bg-[#08110f] p-4"
          >
            <p className="font-mono text-sm font-bold uppercase text-[#ff7b39]">
              {item}
            </p>
            <p className="mt-3 text-sm text-[#d8c79f]">
              Placeholder panel for the first implementation pass.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
