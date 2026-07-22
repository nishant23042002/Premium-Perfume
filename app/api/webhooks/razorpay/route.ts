import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { OrderModel } from "@/models/Order";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

const RAZORPAY_PAYMENT_LABEL = "Paid Online (Razorpay)";

// Defensive backstop for payment confirmation: the client-side
// verifyRazorpayPayment action (lib/actions/checkout.ts) is what normally
// confirms an order, right after the Checkout widget reports success. This
// webhook exists for the case where that call never reaches the server —
// tab closed, network drop — so a real payment doesn't leave an order stuck
// "pending" forever. Configure this URL in the Razorpay Dashboard under
// Settings > Webhooks, subscribed to the `payment.captured` event.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  if (payload.event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const payment = payload.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  const razorpayPaymentId = payment?.id;
  if (!razorpayOrderId || !razorpayPaymentId) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  await connectToDatabase();
  const order = await OrderModel.findOne({ "payment.razorpayOrderId": razorpayOrderId });
  if (!order) return NextResponse.json({ received: true });

  // Idempotent: verifyRazorpayPayment may have already confirmed this order
  // through the normal client-side path by the time the webhook arrives.
  if (order.payment.status !== "paid") {
    order.payment.status = "paid";
    order.payment.transactionId = razorpayPaymentId;
    order.payment.paidAt = new Date();
    order.status = "confirmed";
    await order.save();

    if (order.email) {
      await sendOrderConfirmationEmail({
        to: order.email,
        orderNumber: order.orderNumber,
        items: order.items,
        shippingFee: order.shippingFee,
        discount: order.discount,
        total: order.total,
        paymentLabel: RAZORPAY_PAYMENT_LABEL,
        shippingAddress: order.shippingAddress,
      });
    }
  }

  return NextResponse.json({ received: true });
}
