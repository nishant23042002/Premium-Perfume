"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { CouponModel } from "@/models/Coupon";
import { getCurrentAdmin, hasPermission } from "@/lib/data/adminUsers";

export type CouponFormState = { error?: string; success?: string };

async function canManageCoupons(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return hasPermission(admin, "coupons.manage");
}

export async function createCoupon(
  _prevState: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  if (!(await canManageCoupons())) return { error: "You don't have permission to manage coupons." };

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "percentage");
  const value = Number(formData.get("value"));
  const minOrderValueRaw = Number(formData.get("minOrderValue"));
  const maxDiscountRaw = Number(formData.get("maxDiscount"));
  const usageLimitRaw = Number(formData.get("usageLimit"));
  const expiresAtRaw = String(formData.get("expiresAt") ?? "");

  if (!code) return { error: "Coupon code is required." };
  if (type !== "percentage" && type !== "fixed") return { error: "Choose a valid discount type." };
  if (!Number.isFinite(value) || value <= 0) return { error: "Enter a valid discount value." };
  if (type === "percentage" && value > 100) return { error: "A percentage discount can't exceed 100." };

  await connectToDatabase();
  const existing = await CouponModel.findOne({ code });
  if (existing) return { error: "A coupon with that code already exists." };

  await CouponModel.create({
    code,
    type,
    value,
    minOrderValue: minOrderValueRaw > 0 ? minOrderValueRaw : undefined,
    maxDiscount: maxDiscountRaw > 0 ? maxDiscountRaw : undefined,
    usageLimit: usageLimitRaw > 0 ? usageLimitRaw : undefined,
    expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : undefined,
    isActive: true,
  });

  revalidatePath("/admin/coupons");
  return { success: `Coupon ${code} created.` };
}

export async function toggleCouponActive(id: string, isActive: boolean): Promise<void> {
  if (!(await canManageCoupons())) return;
  await connectToDatabase();
  await CouponModel.findByIdAndUpdate(id, { isActive });
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string): Promise<void> {
  if (!(await canManageCoupons())) return;
  await connectToDatabase();
  await CouponModel.findByIdAndDelete(id);
  revalidatePath("/admin/coupons");
}
