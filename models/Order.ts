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

    // Payment-ready: no gateway wired up yet. `provider` stays null until
    // Razorpay/Stripe (or COD) is selected at checkout in a later phase.
    payment: {
      provider: { type: String, enum: ["cod", "razorpay", "stripe", null], default: null },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: { type: String },
      paidAt: { type: Date },
    },
  },
  { timestamps: true },
);

export type Order = InferSchemaType<typeof orderSchema>;

export const OrderModel = models.Order ?? model("Order", orderSchema);
