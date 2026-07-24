/**
 * TEMPORARY: set to 0 while confirming live Razorpay payments work end to
 * end — a ₹99 fee on top of a minimal test purchase makes it harder to keep
 * the real-money test small. Restore to 99 once live payment is confirmed
 * working, then this file can go back to being a single-line change instead
 * of hunting down every place shipping was hardcoded.
 */
export const SHIPPING_FEE = 0;

/** Unaffected by the above — still the subtotal at which shipping would
 * normally become free once SHIPPING_FEE is restored. */
export const FREE_SHIPPING_THRESHOLD = 999;
