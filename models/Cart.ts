import { Schema, model, models, type InferSchemaType } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceSnapshot: { type: Number, required: true },
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    items: { type: [cartItemSchema], default: [] },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type Cart = InferSchemaType<typeof cartSchema>;

export const CartModel = models.Cart ?? model("Cart", cartSchema);
