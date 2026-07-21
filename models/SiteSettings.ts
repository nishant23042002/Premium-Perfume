import { Schema, model, models, type InferSchemaType } from "mongoose";

// Singleton document — there is only ever one SiteSettings record, looked up
// via findOne({}) rather than a known id, matching the temporary admin
// panel's existing pattern for content it manages.
const siteSettingsSchema = new Schema(
  {
    logo: {
      publicId: { type: String },
      alt: { type: String },
      width: { type: Number },
      height: { type: Number },
    },
  },
  { timestamps: true },
);

export type SiteSettings = InferSchemaType<typeof siteSettingsSchema>;

export const SiteSettingsModel = models.SiteSettings ?? model("SiteSettings", siteSettingsSchema);
