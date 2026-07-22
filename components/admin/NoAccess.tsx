import { ShieldAlert } from "lucide-react";

export function NoAccess() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-admin-border bg-admin-surface py-20 text-center">
      <ShieldAlert className="h-8 w-8 text-admin-ink-faint" strokeWidth={1.5} />
      <p className="text-sm font-medium text-admin-ink">You don&apos;t have access to this section</p>
      <p className="text-sm text-admin-ink-faint">Ask an owner if you need this permission.</p>
    </div>
  );
}
