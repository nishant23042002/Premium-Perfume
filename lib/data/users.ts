import type { Types } from "mongoose";
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

/** Reads the logged-in user from the session cookie, or null if not logged in. Safe for Server Components. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;

  await connectToDatabase();
  const user = await UserModel.findById(session.userId).lean<LeanUser | null>();
  if (!user) return null;

  return toCurrentUser(user);
}
