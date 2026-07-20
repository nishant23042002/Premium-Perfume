import { Schema, model, models, type InferSchemaType } from "mongoose";

const collectionSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    image: {
      publicId: { type: String },
      alt: { type: String },
    },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isFeatured: { type: Boolean, default: false },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
    },
  },
  { timestamps: true },
);

export type Collection = InferSchemaType<typeof collectionSchema>;

export const CollectionModel = models.Collection ?? model("Collection", collectionSchema);
