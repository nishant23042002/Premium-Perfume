import { Schema, model, models, type InferSchemaType } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    sizeMl: { type: Number, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const addressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },

    items: { type: [orderItemSchema], required: true },

    // Optional — collected at checkout solely so we have somewhere to send
    // the order confirmation email. Not required, since phone is already
    // the primary contact channel for this store.
    email: { type: String },

    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema },

    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String },

    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },

    payment: {
      provider: { type: String, enum: ["cod", "razorpay", "stripe", null], default: null },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      // Set when a Razorpay order is created at checkout, before payment
      // completes — used to match the client's verification callback (and
      // the webhook) back to this order.
      razorpayOrderId: { type: String, index: true },
      transactionId: { type: String },
      paidAt: { type: Date },
    },
  },
  { timestamps: true },
);

export type Order = InferSchemaType<typeof orderSchema>;

export const OrderModel = models.Order ?? model("Order", orderSchema);
