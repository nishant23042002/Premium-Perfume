type Notes = { top: string[]; heart: string[]; base: string[] };

export function NotesPyramid({ notes }: { notes: Notes }) {
  const tiers = [
    { label: "Top Notes", items: notes.top },
    { label: "Heart Notes", items: notes.heart },
    { label: "Base Notes", items: notes.base },
  ].filter((tier) => tier.items.length > 0);

  if (tiers.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {tiers.map((tier) => (
        <div
          key={tier.label}
          className="flex flex-col items-center gap-3 border border-ink/10 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent-dark/40 hover:shadow-md"
        >
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-accent-dark">
            {tier.label}
          </span>
          <p className="font-display text-lg text-ink">{tier.items.join(" · ")}</p>
        </div>
      ))}
    </div>
  );
}
