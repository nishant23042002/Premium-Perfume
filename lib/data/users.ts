import type { Types } from "mongoose";
import { cache } from "react";
import { connectToDatabase } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { getSession } from "@/lib/auth-session";

export type AddressDoc = {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};

export type CurrentUser = {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  addresses: AddressDoc[];
};

type LeanUser = {
  _id: Types.ObjectId;
  phone: string;
  name?: string;
  email?: string;
  addresses: (Omit<AddressDoc, "_id"> & { _id: Types.ObjectId })[];
};

function toCurrentUser(doc: LeanUser): CurrentUser {
  return {
    id: String(doc._id),
    phone: doc.phone,
    name: doc.name,
    email: doc.email,
    addresses: doc.addresses.map((address) => ({
      ...address,
      _id: String(address._id),
    })),
  };
}

/** Looks up an existing user by their verified Firebase phone identity, creating one on first login. */
export async function findOrCreateUserByPhone(
  phone: string,
  firebaseUid: string,
): Promise<CurrentUser> {
  await connectToDatabase();

  const existing = await UserModel.findOneAndUpdate(
    { firebaseUid },
    { $setOnInsert: { phone, firebaseUid } },
    { upsert: true, new: true },
  ).lean<LeanUser | null>();

  // upsert: true, new: true guarantees a document is always returned.
  return toCurrentUser(existing!);
}

/** Reads the logged-in user from the session cookie, or null if not logged
 * in. Safe for Server Components. Wrapped in `cache()` — the storefront
 * layout and Header both call this on every request, and without
 * memoization that's two identical DB round trips per navigation. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session) return null;

  await connectToDatabase();
  const user = await UserModel.findById(session.userId).lean<LeanUser | null>();
  if (!user) return null;

  return toCurrentUser(user);
});

type OrderAddressInput = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

/** Saves the address used on a just-placed order back to the customer's
 * profile, marked as their default, so it's offered pre-filled on their next
 * checkout instead of an empty form. Matches against an existing saved
 * address by line1 + pincode so re-ordering to the same place updates that
 * entry in place rather than piling up duplicates. Also backfills the
 * customer's own name/email from the checkout details the first time either
 * is missing — customers only ever type those into the checkout form, never
 * into a dedicated "profile" field, so without this the account page would
 * stay blank forever. Never overwrites a value the customer already set. */
export async function saveAddressFromOrder(
  userId: string,
  address: OrderAddressInput,
  email?: string,
): Promise<void> {
  await connectToDatabase();

  const user = await UserModel.findById(userId, "addresses name email").lean<{
    addresses: { _id: Types.ObjectId; line1: string; pincode: string }[];
    name?: string;
    email?: string;
  } | null>();
  if (!user) return;

  const profileBackfill: Record<string, string> = {};
  if (!user.name && address.fullName) profileBackfill.name = address.fullName;
  if (!user.email && email) profileBackfill.email = email;

  const normalizedLine1 = address.line1.trim().toLowerCase();
  const normalizedPincode = address.pincode.trim();
  const match = user.addresses.find(
    (a) => a.line1.trim().toLowerCase() === normalizedLine1 && a.pincode.trim() === normalizedPincode,
  );

  await UserModel.updateOne({ _id: userId }, { $set: { "addresses.$[].isDefault": false } });

  if (match) {
    await UserModel.updateOne(
      { _id: userId, "addresses._id": match._id },
      {
        $set: {
          "addresses.$.fullName": address.fullName,
          "addresses.$.phone": address.phone,
          "addresses.$.line2": address.line2,
          "addresses.$.city": address.city,
          "addresses.$.state": address.state,
          "addresses.$.isDefault": true,
          ...profileBackfill,
        },
      },
    );
  } else {
    await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          addresses: {
            label: user.addresses.length === 0 ? "Home" : "Address",
            ...address,
            country: "India",
            isDefault: true,
          },
        },
        ...(Object.keys(profileBackfill).length > 0 && { $set: profileBackfill }),
      },
    );
  }
}
