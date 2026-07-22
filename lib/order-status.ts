// Client-safe: no database imports. Split out from lib/data/orders.ts so
// client components (e.g. components/admin/OrdersList.tsx) can import the
// status list/types without pulling Mongoose — and with it Node built-ins
// like `fs`/`net`/`tls` — into the browser bundle.

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type AdminOrderRow = {
  orderNumber: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  paymentProvider: "cod" | "razorpay" | "stripe" | null;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
};
