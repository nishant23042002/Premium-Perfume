import { Resend } from "resend";

let client: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const formatInr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

type OrderEmailItem = { name: string; sizeMl: number; quantity: number; price: number };

/** Best-effort — a missing RESEND_API_KEY or a send failure is logged and
 * swallowed rather than thrown, since email is a nice-to-have that must
 * never block an order from completing. */
export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  items: OrderEmailItem[];
  shippingFee: number;
  discount: number;
  total: number;
  paymentLabel: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping order confirmation email.");
    return;
  }

  const itemRows = params.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#2b211b;font-size:14px;">${escapeHtml(item.name)} (${item.sizeMl}ml) &times; ${item.quantity}</td>
          <td style="padding:8px 0;text-align:right;color:#2b211b;font-size:14px;white-space:nowrap;">${formatInr(item.price * item.quantity)}</td>
        </tr>`,
    )
    .join("");

  const address = params.shippingAddress;
  const html = `
    <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;background:#faf6f0;padding:32px 24px;">
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c48b3e;margin:0 0 8px;">THE RARESKIN</p>
      <h1 style="font-size:22px;color:#2b211b;margin:0 0 4px;">Order Confirmed</h1>
      <p style="font-size:14px;color:#4a3d36;margin:0 0 24px;">Order ${escapeHtml(params.orderNumber)}</p>
      <table style="width:100%;border-collapse:collapse;">
        ${itemRows}
        ${
          params.discount > 0
            ? `<tr><td style="padding:8px 0;color:#c48b3e;font-size:14px;">Discount</td><td style="padding:8px 0;text-align:right;color:#c48b3e;font-size:14px;">&minus;${formatInr(params.discount)}</td></tr>`
            : ""
        }
        <tr><td style="padding:8px 0;color:#4a3d36;font-size:14px;">Shipping</td><td style="padding:8px 0;text-align:right;color:#4a3d36;font-size:14px;">${params.shippingFee === 0 ? "Free" : formatInr(params.shippingFee)}</td></tr>
        <tr><td style="padding:12px 0 0;border-top:1px solid #e5ddd0;font-weight:600;color:#2b211b;font-size:15px;">Total</td><td style="padding:12px 0 0;border-top:1px solid #e5ddd0;text-align:right;font-weight:600;color:#2b211b;font-size:15px;">${formatInr(params.total)}</td></tr>
      </table>
      <p style="font-size:13px;color:#4a3d36;margin:24px 0 4px;font-weight:600;">Shipping to</p>
      <p style="font-size:13px;color:#4a3d36;margin:0;line-height:1.5;">
        ${escapeHtml(address.fullName)}<br/>
        ${escapeHtml(address.line1)}${address.line2 ? `, ${escapeHtml(address.line2)}` : ""}<br/>
        ${escapeHtml(address.city)}, ${escapeHtml(address.state)} ${escapeHtml(address.pincode)}
      </p>
      <p style="font-size:13px;color:#4a3d36;margin:16px 0 0;">Payment: ${escapeHtml(params.paymentLabel)}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "THE RARESKIN <onboarding@resend.dev>",
      to: params.to,
      subject: `Order Confirmed — ${params.orderNumber}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
}

const FROM_ADDRESS = () => process.env.RESEND_FROM_EMAIL || "THE RARESKIN <onboarding@resend.dev>";

/** Shared wrapper for the shorter status-update emails below — same
 * best-effort behavior as sendOrderConfirmationEmail (never throws), same
 * branded shell, just a single message body instead of a line-item table. */
function statusEmailHtml(orderNumber: string, heading: string, bodyHtml: string): string {
  return `
    <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;background:#faf6f0;padding:32px 24px;">
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c48b3e;margin:0 0 8px;">THE RARESKIN</p>
      <h1 style="font-size:22px;color:#2b211b;margin:0 0 4px;">${escapeHtml(heading)}</h1>
      <p style="font-size:14px;color:#4a3d36;margin:0 0 20px;">Order ${escapeHtml(orderNumber)}</p>
      ${bodyHtml}
    </div>
  `;
}

async function sendStatusEmail(to: string, subject: string, html: string, logLabel: string): Promise<void> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`RESEND_API_KEY not set — skipping ${logLabel} email.`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM_ADDRESS(), to, subject, html });
  } catch (error) {
    console.error(`Failed to send ${logLabel} email:`, error);
  }
}

/** Sent when a cancellation is finalized immediately — COD orders, or a
 * Razorpay order that was never actually paid — where there's no money to
 * return, so nothing further is needed from the customer. */
export async function sendOrderCancelledEmail(params: {
  to: string;
  orderNumber: string;
  total: number;
  reason?: string;
}): Promise<void> {
  const body = `
    <p style="font-size:14px;color:#2b211b;margin:0 0 16px;">Your order has been cancelled${params.reason ? ` (${escapeHtml(params.reason)})` : ""}. No payment was collected, so there's nothing further to refund.</p>
    <p style="font-size:14px;color:#4a3d36;margin:0;">Order total: ${formatInr(params.total)}</p>
  `;
  await sendStatusEmail(
    params.to,
    `Order Cancelled — ${params.orderNumber}`,
    statusEmailHtml(params.orderNumber, "Order Cancelled", body),
    "order cancelled",
  );
}

/** Sent when a customer requests cancellation on an order that was already
 * paid online — the refund isn't instant, so this sets the expectation that
 * a team member will review it first. */
export async function sendCancellationRequestedEmail(params: {
  to: string;
  orderNumber: string;
  total: number;
  reason?: string;
}): Promise<void> {
  const body = `
    <p style="font-size:14px;color:#2b211b;margin:0 0 16px;">We've received your cancellation request${params.reason ? ` (${escapeHtml(params.reason)})` : ""}. Since this order was paid online, our team will review it and process your refund of ${formatInr(params.total)} shortly.</p>
    <p style="font-size:14px;color:#4a3d36;margin:0;">You'll get a separate email once the refund is on its way.</p>
  `;
  await sendStatusEmail(
    params.to,
    `Cancellation Request Received — ${params.orderNumber}`,
    statusEmailHtml(params.orderNumber, "Cancellation Request Received", body),
    "cancellation requested",
  );
}

/** Sent once an admin approves a cancellation and the real Razorpay refund
 * has actually gone through — never sent just because a status changed. */
export async function sendRefundProcessedEmail(params: {
  to: string;
  orderNumber: string;
  refundAmount: number;
}): Promise<void> {
  const body = `
    <p style="font-size:14px;color:#2b211b;margin:0 0 16px;">Your refund of ${formatInr(params.refundAmount)} has been processed and sent back to your original payment method.</p>
    <p style="font-size:14px;color:#4a3d36;margin:0;">It typically takes 5–7 business days to reflect in your account, depending on your bank.</p>
  `;
  await sendStatusEmail(
    params.to,
    `Refund Processed — ${params.orderNumber}`,
    statusEmailHtml(params.orderNumber, "Refund Processed", body),
    "refund processed",
  );
}

/** Sent when an admin declines a customer's cancellation request — the
 * order's status reverts to whatever it was before the request, so this is
 * just letting the customer know rather than leaving them wondering. */
export async function sendCancellationDeclinedEmail(params: {
  to: string;
  orderNumber: string;
}): Promise<void> {
  const body = `
    <p style="font-size:14px;color:#2b211b;margin:0 0 16px;">We're unable to cancel this order — it's already being prepared for shipment. If you have questions, please reach out to our support team.</p>
  `;
  await sendStatusEmail(
    params.to,
    `Cancellation Request Declined — ${params.orderNumber}`,
    statusEmailHtml(params.orderNumber, "Cancellation Request Declined", body),
    "cancellation declined",
  );
}
