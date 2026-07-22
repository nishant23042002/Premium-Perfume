import { Schema, model, models, type InferSchemaType } from "mongoose";

const rolePermissionsSchema = new Schema(
  {
    // "owner" is deliberately never stored here — see lib/rbac.ts.
    role: { type: String, enum: ["developer", "staff"], required: true, unique: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true },
);

export type RolePermissionsDoc = InferSchemaType<typeof rolePermissionsSchema>;

export const RolePermissionsModel = models.RolePermissions ?? model("RolePermissions", rolePermissionsSchema);
