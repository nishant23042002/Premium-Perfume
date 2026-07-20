"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/data/faqs";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?._id ?? null);

  return (
    <div className="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item) => {
        const isOpen = openId === item._id;
        return (
          <div key={item._id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item._id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-sans text-sm font-medium text-ink">{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-ink/50 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <p className="pb-5 font-sans text-sm text-ink/65">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
