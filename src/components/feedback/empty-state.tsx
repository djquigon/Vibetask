type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-vt-border bg-vt-surface p-6">
      <h2 className="font-mono text-xl font-black uppercase text-vt-text-strong">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-vt-text-muted">{description}</p>
    </div>
  );
}
