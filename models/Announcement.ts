import { Schema, model, models, type InferSchemaType } from "mongoose";

const announcementSchema = new Schema(
  {
    text: { type: String, required: true },
    link: { type: String },
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type Announcement = InferSchemaType<typeof announcementSchema>;

export const AnnouncementModel = models.Announcement ?? model("Announcement", announcementSchema);
