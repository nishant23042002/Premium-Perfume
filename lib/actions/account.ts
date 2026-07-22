"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { getSession } from "@/lib/auth-session";

export type AccountActionState = { error?: string; success?: string };

export async function updateProfile(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  await connectToDatabase();

  const set: Record<string, string> = {};
  const unset: Record<string, string> = {};
  if (name) set.name = name;
  else unset.name = "";
  if (email) set.email = email;
  else unset.email = "";

  await UserModel.updateOne(
    { _id: session.userId },
    { ...(Object.keys(set).length && { $set: set }), ...(Object.keys(unset).length && { $unset: unset }) },
  );

  revalidatePath("/account");
  return { success: "Profile updated." };
}

export type AddressFormState = { error?: string; success?: string };

const REQUIRED_ADDRESS_FIELDS = ["fullName", "phone", "line1", "city", "state", "pincode"] as const;

function readAddressFields(formData: FormData) {
  return {
    label: String(formData.get("label") ?? "").trim() || "Home",
    fullName: String(formData.get("fullName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    line1: String(formData.get("line1") ?? "").trim(),
    line2: String(formData.get("line2") ?? "").trim() || undefined,
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    pincode: String(formData.get("pincode") ?? "").trim(),
    country: "India",
  };
}

async function clearDefaultAddresses(userId: string): Promise<void> {
  await UserModel.updateOne({ _id: userId }, { $set: { "addresses.$[].isDefault": false } });
}

export async function saveAddress(
  _prevState: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const session = await getSession();
  if (!session) return { error: "You must be signed in." };

  const fields = readAddressFields(formData);
  for (const key of REQUIRED_ADDRESS_FIELDS) {
    if (!fields[key]) return { error: "Please fill in all required fields." };
  }

  const addressId = String(formData.get("addressId") ?? "").trim();
  const makeDefault = formData.get("isDefault") === "on";

  await connectToDatabase();

  if (addressId) {
    if (makeDefault) await clearDefaultAddresses(session.userId);
    await UserModel.updateOne(
      { _id: session.userId, "addresses._id": addressId },
      {
        $set: {
          "addresses.$.label": fields.label,
          "addresses.$.fullName": fields.fullName,
          "addresses.$.phone": fields.phone,
          "addresses.$.line1": fields.line1,
          "addresses.$.line2": fields.line2,
          "addresses.$.city": fields.city,
          "addresses.$.state": fields.state,
          "addresses.$.pincode": fields.pincode,
          ...(makeDefault && { "addresses.$.isDefault": true }),
        },
      },
    );
  } else {
    const user = await UserModel.findById(session.userId, "addresses").lean<{ addresses: unknown[] } | null>();
    const isFirst = !user?.addresses.length;
    if (makeDefault && !isFirst) await clearDefaultAddresses(session.userId);

    await UserModel.updateOne(
      { _id: session.userId },
      {
        $push: {
          addresses: { _id: new Types.ObjectId(), ...fields, isDefault: isFirst || makeDefault },
        },
      },
    );
  }

  // Backfill the customer's own profile name from the address, the same way
  // checkout does — only if they haven't already set one themselves.
  const current = await UserModel.findById(session.userId, "name").lean<{ name?: string } | null>();
  if (current && !current.name && fields.fullName) {
    await UserModel.updateOne({ _id: session.userId }, { $set: { name: fields.fullName } });
  }

  revalidatePath("/account");
  return { success: "Address saved." };
}

export async function deleteAddress(addressId: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  await connectToDatabase();
  await UserModel.updateOne({ _id: session.userId }, { $pull: { addresses: { _id: addressId } } });
  revalidatePath("/account");
}

export async function setDefaultAddress(addressId: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  await connectToDatabase();
  await clearDefaultAddresses(session.userId);
  await UserModel.updateOne(
    { _id: session.userId, "addresses._id": addressId },
    { $set: { "addresses.$.isDefault": true } },
  );
  revalidatePath("/account");
}
