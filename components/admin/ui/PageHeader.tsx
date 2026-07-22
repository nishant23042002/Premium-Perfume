export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-admin-ink sm:text-2xl">{title}</h1>
        {description && <p className="text-sm text-admin-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
