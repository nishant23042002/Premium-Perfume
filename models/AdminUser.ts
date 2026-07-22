import { Schema, model, models, type InferSchemaType } from "mongoose";
import { ADMIN_ROLES, type AdminRole } from "@/lib/rbac";

export { ADMIN_ROLES, type AdminRole };

const adminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ADMIN_ROLES, required: true, default: "staff" },
    // Deactivating (rather than deleting) preserves whoever-did-what history
    // on orders/content while still fully blocking login.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type AdminUser = InferSchemaType<typeof adminUserSchema>;

export const AdminUserModel = models.AdminUser ?? model("AdminUser", adminUserSchema);
