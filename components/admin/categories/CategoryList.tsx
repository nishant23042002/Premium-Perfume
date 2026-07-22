"use client";

import { useTransition } from "react";
import { deleteCategory } from "@/lib/actions/categories";
import type { AdminCategory } from "@/lib/data/categories";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { ProductImage } from "@/components/ui/ProductImage";

function Row({ category }: { category: AdminCategory }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="border-b border-admin-border last:border-0">
      <td className="px-4 py-3">
        <div className="h-12 w-16 overflow-hidden rounded-lg bg-admin-bg">
          {category.image && <ProductImage publicId={category.image.publicId} alt={category.image.alt ?? category.name} className="h-full w-full" />}
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-admin-ink">{category.name}</td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">/{category.slug}</td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">{category.order}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => deleteCategory(category.id))}
          className="rounded-lg border border-admin-danger-bg px-3 py-1.5 text-xs font-medium uppercase text-admin-danger disabled:opacity-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export function CategoryList({ categories }: { categories: AdminCategory[] }) {
  if (categories.length === 0) {
    return <p className="text-sm text-admin-ink-faint">No categories yet.</p>;
  }

  return (
    <AdminCard className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-admin-border bg-admin-bg text-left text-xs font-semibold uppercase tracking-wide text-admin-ink-faint">
            <th className="px-4 py-2.5">Image</th>
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">Slug</th>
            <th className="px-4 py-2.5">Order</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <Row key={category.id} category={category} />
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
