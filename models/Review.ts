import { Schema, model, models, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    body: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export type Review = InferSchemaType<typeof reviewSchema>;

export const ReviewModel = models.Review ?? model("Review", reviewSchema);
