import { CouponModel } from "@/models/Coupon";

export type AppliedCoupon = { code: string; discount: number };

/** Validates a coupon against the current order (specific, friendly error
 * messages), then atomically claims one use — the usage-limit check is
 * re-verified inside the same update so two customers racing for the last
 * redemption of a limited code can't both win. */
export async function applyCoupon(
  rawCode: string,
  subtotal: number,
): Promise<{ ok: true; coupon: AppliedCoupon } | { ok: false; error: string }> {
  const code = rawCode.trim().toUpperCase();
  const coupon = await CouponModel.findOne({ code });

  if (!coupon || !coupon.isActive) return { ok: false, error: "That coupon code isn't valid." };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "That coupon code has expired." };
  }
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return { ok: false, error: `This code needs a minimum order of ₹${coupon.minOrderValue}.` };
  }

  const claimed = await CouponModel.findOneAndUpdate(
    {
      _id: coupon._id,
      $expr: {
        $or: [
          // A missing usageLimit field is NOT the same as an explicit null
          // to $expr's strict $eq — $ifNull normalizes "field absent" to
          // null so uncapped coupons (no usageLimit set at all) match here.
          { $eq: [{ $ifNull: ["$usageLimit", null] }, null] },
          { $lt: ["$usedCount", "$usageLimit"] },
        ],
      },
    },
    { $inc: { usedCount: 1 } },
    { returnDocument: "after" },
  );
  if (!claimed) return { ok: false, error: "This coupon code just reached its usage limit." };

  let discount = coupon.type === "percentage" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);

  return { ok: true, coupon: { code, discount } };
}

/** Releases a previously-claimed coupon use — called whenever an order that
 * had a coupon applied is rolled back, abandoned pre-payment, or cancelled
 * (by the customer or an admin), so the code's usage count doesn't stay
 * permanently inflated by orders that never actually went through. */
export async function releaseCoupon(code: string): Promise<void> {
  await CouponModel.updateOne({ code }, { $inc: { usedCount: -1 } });
}
