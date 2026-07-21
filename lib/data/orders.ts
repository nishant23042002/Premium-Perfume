import { connectToDatabase } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";

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
  total: number;
  status: string;
};

export async function getOrderByNumber(orderNumber: string): Promise<OrderDetail | null> {
  await connectToDatabase();
  const order = await OrderModel.findOne({ orderNumber }).lean();
  return order ? JSON.parse(JSON.stringify(order)) : null;
}

export type OrderSummary = {
  orderNumber: string;
  itemCount: number;
  total: number;
  status: string;
  createdAt: string;
};

export async function getOrdersByUserId(userId: string): Promise<OrderSummary[]> {
  await connectToDatabase();
  const orders = await OrderModel.find({ userId })
    .sort({ createdAt: -1 })
    .select("orderNumber items total status createdAt")
    .lean();

  return orders.map((order) => ({
    orderNumber: order.orderNumber,
    itemCount: order.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
    total: order.total,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  }));
}
