import { Schema, model, models, type InferSchemaType } from "mongoose";

const categoryShowcaseSchema = new Schema(
  {
    title: { type: String, required: true },
    linkHref: { type: String, required: true },
    image: {
      publicId: { type: String, required: true },
      alt: { type: String, required: true },
      width: { type: Number },
      height: { type: Number },
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type CategoryShowcase = InferSchemaType<typeof categoryShowcaseSchema>;

export const CategoryShowcaseModel =
  models.CategoryShowcase ?? model("CategoryShowcase", categoryShowcaseSchema);
