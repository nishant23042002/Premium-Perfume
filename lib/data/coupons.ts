import { connectToDatabase } from "@/lib/db/connect";
import { CouponModel } from "@/models/Coupon";

export type AdminCoupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  isExpired: boolean;
  isExhausted: boolean;
};

export async function getAllCoupons(): Promise<AdminCoupon[]> {
  await connectToDatabase();
  const coupons = await CouponModel.find({}).sort({ createdAt: -1 }).lean();
  const now = Date.now();
  return coupons.map((c) => ({
    id: String(c._id),
    code: c.code,
    type: c.type,
    value: c.value,
    minOrderValue: c.minOrderValue,
    maxDiscount: c.maxDiscount,
    expiresAt: c.expiresAt?.toISOString(),
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    isActive: c.isActive,
    isExpired: c.expiresAt ? c.expiresAt.getTime() < now : false,
    isExhausted: c.usageLimit ? c.usedCount >= c.usageLimit : false,
  }));
}
