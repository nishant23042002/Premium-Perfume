export type PaymentProvider = "cod" | "razorpay" | "stripe";

export type CreatePaymentInput = {
  orderId: string;
  amount: number; // smallest currency unit (paise)
  currency: string;
};

export type CreatePaymentResult = {
  provider: PaymentProvider;
  reference: string;
  redirectUrl?: string;
};

// No implementation yet — Order.payment.provider stays null until a provider
// (Razorpay, Stripe, or COD) is wired up behind this interface in a later phase.
export interface PaymentGateway {
  provider: PaymentProvider;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(reference: string): Promise<boolean>;
}
