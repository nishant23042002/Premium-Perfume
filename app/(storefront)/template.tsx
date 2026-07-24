/** Next.js gives this file convention a fresh key per navigation
 * automatically (unlike layout.tsx, which persists and never remounts) —
 * see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/template.md.
 * That guaranteed remount is what replays the CSS entrance animation
 * consistently on every route change, without relying on a hand-rolled
 * key={pathname} client component racing the router's own state updates. */
export default function StorefrontTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-fade flex flex-1 flex-col">{children}</div>;
}
