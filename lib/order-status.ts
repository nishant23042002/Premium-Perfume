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
  "cancellation_requested",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Statuses an admin can pick directly from the status dropdown.
// "cancellation_requested" is entered only via a customer's own cancel
// request and left only via the dedicated approve/reject actions — it's
// never a valid manual target.
export const ADMIN_SELECTABLE_STATUSES: OrderStatus[] = ORDER_STATUSES.filter(
  (s) => s !== "cancellation_requested",
);

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancellation_requested: "Cancellation Requested",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

// A customer may only self-cancel while an order is still in one of these
// statuses — once it ships, cancellation goes through support instead.
export const CUSTOMER_CANCELLABLE_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing"];

export type OrderCancellation = {
  reason?: string;
  requestedBy?: "customer" | "admin";
  requestedAt?: string;
  previousStatus?: OrderStatus;
  resolution?: "auto" | "approved" | "rejected";
  resolvedAt?: string;
  resolvedBy?: string;
};

export type AdminOrderRow = {
  orderNumber: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  paymentProvider: "cod" | "razorpay" | "stripe" | null;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  cancellation?: OrderCancellation;
};
