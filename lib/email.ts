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
