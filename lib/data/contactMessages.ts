import { connectToDatabase } from "@/lib/db/connect";
import { ContactMessageModel } from "@/models/ContactMessage";

export type AdminContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "new" | "read";
  createdAt: string;
};

export async function getAllContactMessages(): Promise<AdminContactMessage[]> {
  await connectToDatabase();
  const messages = await ContactMessageModel.find({}).sort({ createdAt: -1 }).lean();
  return messages.map((m) => ({
    id: String(m._id),
    name: m.name,
    email: m.email,
    phone: m.phone,
    subject: m.subject,
    message: m.message,
    status: m.status,
    createdAt: m.createdAt.toISOString(),
  }));
}
