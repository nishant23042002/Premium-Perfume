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
