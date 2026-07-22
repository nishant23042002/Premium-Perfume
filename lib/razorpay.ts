import Razorpay from "razorpay";
import crypto from "node:crypto";

let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (client) return client;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set in .env.local.");
  }

  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

/** Verifies the `razorpay_signature` returned to the client after a
 * successful Checkout payment — HMAC-SHA256 of `order_id|payment_id` signed
 * with the API key secret, per Razorpay's standard checkout verification. */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET is not set in .env.local.");

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  // timingSafeEqual throws on mismatched buffer lengths rather than
  // returning false — an attacker-controlled signature of the wrong length
  // must fail closed here, not crash the request.
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/** Verifies a Razorpay webhook request body against the separate webhook
 * secret configured in the Dashboard (Settings > Webhooks) — not the API
 * key secret used for checkout signature verification above. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not set in .env.local.");

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
