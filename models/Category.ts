import { Schema, model, models, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    image: {
      publicId: { type: String },
      alt: { type: String },
    },
    order: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
    },
  },
  { timestamps: true },
);

export type Category = InferSchemaType<typeof categorySchema>;

export const CategoryModel = models.Category ?? model("Category", categorySchema);
