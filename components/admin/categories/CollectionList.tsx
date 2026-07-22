"use client";

import { useTransition } from "react";
import { toggleCollectionFeatured, deleteCollection } from "@/lib/actions/categories";
import type { AdminCollection } from "@/lib/data/collections";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { ProductImage } from "@/components/ui/ProductImage";

function Row({ collection }: { collection: AdminCollection }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="border-b border-admin-border last:border-0">
      <td className="px-4 py-3">
        <div className="h-12 w-16 overflow-hidden rounded-lg bg-admin-bg">
          {collection.image && (
            <ProductImage publicId={collection.image.publicId} alt={collection.image.alt ?? collection.name} className="h-full w-full" />
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-admin-ink">{collection.name}</td>
      <td className="px-4 py-3 text-xs text-admin-ink-faint">{collection.productCount} products</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => toggleCollectionFeatured(collection.id, !collection.isFeatured))}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium uppercase disabled:opacity-50 ${
              collection.isFeatured
                ? "border-admin-success-bg bg-admin-success-bg text-admin-success"
                : "border-admin-border text-admin-ink-faint"
            }`}
          >
            {collection.isFeatured ? "Featured" : "Not Featured"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => deleteCollection(collection.id))}
            className="rounded-lg border border-admin-danger-bg px-3 py-1.5 text-xs font-medium uppercase text-admin-danger disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CollectionList({ collections }: { collections: AdminCollection[] }) {
  if (collections.length === 0) {
    return <p className="text-sm text-admin-ink-faint">No collections yet.</p>;
  }

  return (
    <AdminCard className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-admin-border bg-admin-bg text-left text-xs font-semibold uppercase tracking-wide text-admin-ink-faint">
            <th className="px-4 py-2.5">Image</th>
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">Products</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {collections.map((collection) => (
            <Row key={collection.id} collection={collection} />
          ))}
        </tbody>
      </table>
    </AdminCard>
  );
}
