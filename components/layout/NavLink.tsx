"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative font-sans text-xs font-medium uppercase tracking-[0.15em] transition-colors duration-300",
        isActive ? "text-accent-dark" : "text-ink/80 hover:text-accent-dark",
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -bottom-1.5 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-accent-dark transition-transform duration-300 ease-out group-hover:scale-x-100",
          isActive && "scale-x-100",
        )}
      />
    </Link>
  );
}
