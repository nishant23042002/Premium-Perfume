import { connectToDatabase } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import {
  ORDER_STATUSES,
  type OrderStatus,
  type AdminOrderRow,
  type OrderCancellation,
} from "@/lib/order-status";

export { ORDER_STATUSES, type OrderStatus, type AdminOrderRow };

export type OrderDetail = {
  orderNumber: string;
  items: {
    sku: string;
    name: string;
    image?: string;
    sizeMl: number;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: string;
  payment: {
    provider: "cod" | "razorpay" | "stripe" | null;
    status: "pending" | "paid" | "failed" | "refunded";
  };
};

export async function getOrderByNumber(orderNumber: string): Promise<OrderDetail | null> {
  await connectToDatabase();
  const order = await OrderModel.findOne({ orderNumber }).lean();
  return order ? JSON.parse(JSON.stringify(order)) : null;
}

export type AccountOrder = {
  orderNumber: string;
  itemCount: number;
  items: {
    sku: string;
    name: string;
    image?: string;
    slug?: string;
    sizeMl: number;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: string;
  payment: {
    provider: "cod" | "razorpay" | "stripe" | null;
    status: string;
    refundedAt?: string;
  };
  cancellation?: OrderCancellation;
  createdAt: string;
};

/** Full order detail (not just a summary) so the account page's Orders tab
 * can show line items and shipping address inline on expand, instead of
 * navigating to a separate order-detail route. */
export async function getOrdersByUserId(userId: string): Promise<AccountOrder[]> {
  await connectToDatabase();
  const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();

  // A product might since be deleted, so this is a best-effort slug lookup
  // (used to link an order line item back to its product page, only when
  // it's still around) — never assumed to cover every item.
  const productIds = new Set<string>();
  for (const order of orders) {
    for (const item of order.items) productIds.add(String(item.productId));
  }
  const products = await ProductModel.find({ _id: { $in: Array.from(productIds) } }, "slug").lean<
    { _id: unknown; slug: string }[]
  >();
  const slugByProductId = new Map(products.map((p) => [String(p._id), p.slug]));

  return orders.map((order) => ({
    orderNumber: order.orderNumber,
    itemCount: order.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
    // Mapped to plain fields only — the raw lean items still carry a
    // Mongoose ObjectId `productId` (ref to Product), which isn't a plain
    // object and can't cross the Server->Client Component boundary that
    // AccountTabs/OrdersTab sit on. `image` is just a snapshotted Cloudinary
    // public ID string, so it's safe to pass through as-is.
    items: order.items.map(
      (item: {
        productId: unknown;
        sku: string;
        name: string;
        image?: string;
        sizeMl: number;
        price: number;
        quantity: number;
      }) => ({
        sku: item.sku,
        name: item.name,
        image: item.image,
        slug: slugByProductId.get(String(item.productId)),
        sizeMl: item.sizeMl,
        price: item.price,
        quantity: item.quantity,
      }),
    ),
    shippingAddress: {
      fullName: order.shippingAddress.fullName,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
    },
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    discount: order.discount,
    couponCode: order.couponCode,
    total: order.total,
    status: order.status,
    payment: {
      provider: order.payment.provider,
      status: order.payment.status,
      refundedAt: order.payment.refundedAt?.toISOString(),
    },
    cancellation: order.cancellation
      ? {
          reason: order.cancellation.reason,
          requestedBy: order.cancellation.requestedBy,
          requestedAt: order.cancellation.requestedAt?.toISOString(),
          previousStatus: order.cancellation.previousStatus as OrderStatus | undefined,
          resolution: order.cancellation.resolution,
          resolvedAt: order.cancellation.resolvedAt?.toISOString(),
          resolvedBy: order.cancellation.resolvedBy,
        }
      : undefined,
    createdAt: order.createdAt.toISOString(),
  }));
}

const ADMIN_PAGE_SIZE = 20;

export async function getOrdersForAdmin(options: {
  status?: OrderStatus;
  page?: number;
}): Promise<{ orders: AdminOrderRow[]; total: number; page: number; totalPages: number }> {
  await connectToDatabase();

  const filter = options.status ? { status: options.status } : {};
  const page = Math.max(1, options.page ?? 1);
  const skip = (page - 1) * ADMIN_PAGE_SIZE;

  const [orders, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ADMIN_PAGE_SIZE)
      .select("orderNumber shippingAddress.fullName items total status payment cancellation createdAt")
      .lean(),
    OrderModel.countDocuments(filter),
  ]);

  return {
    orders: orders.map((order) => ({
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress.fullName,
      itemCount: order.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
      total: order.total,
      status: order.status as OrderStatus,
      paymentProvider: order.payment.provider,
      paymentStatus: order.payment.status,
      createdAt: order.createdAt.toISOString(),
      cancellation: order.cancellation
        ? {
            reason: order.cancellation.reason,
            requestedBy: order.cancellation.requestedBy,
            requestedAt: order.cancellation.requestedAt?.toISOString(),
            previousStatus: order.cancellation.previousStatus as OrderStatus | undefined,
            resolution: order.cancellation.resolution,
            resolvedAt: order.cancellation.resolvedAt?.toISOString(),
            resolvedBy: order.cancellation.resolvedBy,
          }
        : undefined,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  };
}
