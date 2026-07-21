import { Schema, model, models, type InferSchemaType } from "mongoose";

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "read"],
      default: "new",
    },
  },
  { timestamps: true },
);

export type ContactMessage = InferSchemaType<typeof contactMessageSchema>;

export const ContactMessageModel =
  models.ContactMessage ?? model("ContactMessage", contactMessageSchema);
