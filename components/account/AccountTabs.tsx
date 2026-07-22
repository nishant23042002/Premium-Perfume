"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProfileTab } from "@/components/account/ProfileTab";
import { AddressTab } from "@/components/account/AddressTab";
import { OrdersTab } from "@/components/account/OrdersTab";
import type { CurrentUser } from "@/lib/data/users";
import type { AccountOrder } from "@/lib/data/orders";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "address", label: "Address" },
  { key: "orders", label: "Orders" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AccountTabs({
  user,
  orders,
  initialTab = "profile",
  justPlaced,
}: {
  user: CurrentUser;
  orders: AccountOrder[];
  initialTab?: TabKey;
  justPlaced?: string;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  return (
    <div className="flex flex-col gap-8">
      {justPlaced && (
        <div className="border border-accent-dark/30 bg-accent/10 px-5 py-4 font-sans text-sm text-accent-dark">
          Order #{justPlaced} placed successfully — thank you!
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-ink/10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "shrink-0 px-4 py-3 font-sans text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-accent-dark text-accent-dark"
                : "border-b-2 border-transparent text-ink/50 hover:text-ink",
            )}
          >
            {tab.label}
            {tab.key === "orders" && orders.length > 0 && ` (${orders.length})`}
          </button>
        ))}
      </div>

      {activeTab === "profile" && <ProfileTab user={user} />}
      {activeTab === "address" && <AddressTab addresses={user.addresses} />}
      {activeTab === "orders" && <OrdersTab orders={orders} />}
    </div>
  );
}
