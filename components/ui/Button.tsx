import Link from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-ink hover:bg-accent-dark",
  secondary:
    "border border-ink/25 text-ink hover:border-accent-dark hover:text-accent-dark hover:bg-accent/10",
  ghost: "text-ink underline underline-offset-4 hover:text-accent-dark",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-sm",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  loading?: boolean;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, loading = false, children, ...rest } = props;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-sans font-medium uppercase tracking-[0.08em] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-40 disabled:hover:translate-y-0",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if ("href" in props && props.href) {
    return (
      <Link
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={props.href}
        className={classes}
      >
        {children}
      </Link>
    );
  }

  const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button className={classes} disabled={loading || buttonRest.disabled} {...buttonRest}>
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
