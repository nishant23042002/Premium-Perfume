import { Schema, model, models, type InferSchemaType } from "mongoose";

const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, enum: ["product", "shipping", "general"], default: "general" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type FAQ = InferSchemaType<typeof faqSchema>;

export const FAQModel = models.FAQ ?? model("FAQ", faqSchema);
