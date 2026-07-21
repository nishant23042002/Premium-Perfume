import { Schema, model, models, type InferSchemaType } from "mongoose";

const addressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new Schema(
  {
    // Phone is the primary identity — verified via Firebase Phone Auth OTP
    // at login time, so it's always present and trustworthy. Name/email are
    // optional, collected later if the customer chooses to fill in a profile.
    phone: { type: String, required: true, unique: true, trim: true },
    firebaseUid: { type: String, required: true, unique: true },
    name: { type: String },
    email: { type: String, lowercase: true, trim: true },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = models.User ?? model("User", userSchema);
