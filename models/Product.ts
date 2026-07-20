import { Schema, model, models, type InferSchemaType } from "mongoose";

const variantSchema = new Schema(
  {
    sku: { type: String, required: true },
    sizeMl: { type: Number, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    stock: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const imageSchema = new Schema(
  {
    publicId: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String },
    description: { type: String },

    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    collectionIds: [{ type: Schema.Types.ObjectId, ref: "Collection" }],

    concentration: {
      type: String,
      enum: ["EDP", "EDT", "Parfum", "Attar", "Cologne"],
      required: true,
    },

    notes: {
      top: [{ type: String }],
      heart: [{ type: String }],
      base: [{ type: String }],
    },

    highlights: [{ type: String }],
    howToUse: { type: String },
    ingredients: { type: String },

    variants: { type: [variantSchema], required: true },
    images: { type: [imageSchema], required: true },

    // Denormalized from variants — kept in sync by the pre-save hook below so
    // listing pages can sort/filter by price without an aggregation pipeline.
    minPrice: { type: Number, required: true, index: true },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    isBestseller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isLimitedEdition: { type: Boolean, default: false },

    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
    },

    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
  },
  { timestamps: true },
);

productSchema.pre("save", function (next) {
  if (this.variants?.length) {
    this.minPrice = Math.min(...this.variants.map((v) => v.price));
  }
  next();
});

export type Product = InferSchemaType<typeof productSchema>;

export const ProductModel = models.Product ?? model("Product", productSchema);
