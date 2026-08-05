type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-[#f5bf76]/20 bg-[#0d1b17] p-6">
      <h2 className="font-mono text-xl font-black uppercase text-[#fff0c8]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#d8c79f]">{description}</p>
    </div>
  );
}
