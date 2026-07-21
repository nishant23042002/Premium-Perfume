import { Schema, model, models, type InferSchemaType } from "mongoose";

const offerBannerSchema = new Schema(
  {
    eyebrow: { type: String },
    title: { type: String, required: true },
    subtitle: { type: String },
    linkHref: { type: String },
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

export type OfferBanner = InferSchemaType<typeof offerBannerSchema>;

export const OfferBannerModel = models.OfferBanner ?? model("OfferBanner", offerBannerSchema);
