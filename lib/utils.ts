export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Full literal class strings (not string-concatenated) so Tailwind's
// scanner can find them — desktop column count matches however many
// products actually exist (up to 4), so a small catalog fills the row
// instead of leaving a gap, while staying correct once more are added.
const DESKTOP_PRODUCT_GRID_COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};
const DEFAULT_DESKTOP_PRODUCT_GRID_COLUMNS = "sm:grid-cols-2 lg:grid-cols-4";

export function adaptiveProductGridColumns(count: number): string {
  return DESKTOP_PRODUCT_GRID_COLUMNS[count] ?? DEFAULT_DESKTOP_PRODUCT_GRID_COLUMNS;
}
