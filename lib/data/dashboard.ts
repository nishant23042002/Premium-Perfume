import { connectToDatabase } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { ReviewModel } from "@/models/Review";
import { ContactMessageModel } from "@/models/ContactMessage";

const LOW_STOCK_THRESHOLD = 5;

export type DashboardStats = {
  ordersToday: number;
  revenueToday: number;
  ordersThisWeek: number;
  needsFulfillment: number;
  lowStockCount: number;
  pendingReviews: number;
  newContactMessages: number;
  recentOrders: {
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectToDatabase();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

  const [
    todayOrders,
    weekOrderCount,
    needsFulfillment,
    lowStockCount,
    pendingReviews,
    newContactMessages,
    recentOrders,
  ] = await Promise.all([
    OrderModel.find({ createdAt: { $gte: startOfToday } }, "total").lean(),
    OrderModel.countDocuments({ createdAt: { $gte: startOfWeek } }),
    OrderModel.countDocuments({ status: { $in: ["confirmed", "processing"] } }),
    ProductModel.countDocuments({ "variants.stock": { $lte: LOW_STOCK_THRESHOLD } }),
    ReviewModel.countDocuments({ status: "pending" }),
    ContactMessageModel.countDocuments({}),
    OrderModel.find({}, "orderNumber shippingAddress.fullName total status createdAt")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return {
    ordersToday: todayOrders.length,
    revenueToday: todayOrders.reduce((sum, o) => sum + o.total, 0),
    ordersThisWeek: weekOrderCount,
    needsFulfillment,
    lowStockCount,
    pendingReviews,
    newContactMessages,
    recentOrders: recentOrders.map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.shippingAddress.fullName,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}
