import { Schema, model, models, type InferSchemaType } from "mongoose";

const bannerSchema = new Schema(
  {
    title: { type: String },
    subtitle: { type: String },
    image: {
      publicId: { type: String, required: true },
      alt: { type: String, required: true },
      width: { type: Number },
      height: { type: Number },
    },
    // Optional art-directed crop shown on phones instead of `image` — falls
    // back to `image` when not provided so older banners keep working.
    mobileImage: {
      publicId: { type: String },
      alt: { type: String },
      width: { type: Number },
      height: { type: Number },
    },
    linkHref: { type: String },
    placement: {
      type: String,
      enum: ["homepage-hero"],
      default: "homepage-hero",
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type Banner = InferSchemaType<typeof bannerSchema>;

export const BannerModel = models.Banner ?? model("Banner", bannerSchema);
