import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Service-account private keys are stored in .env as a single line with
  // literal "\n" escapes standing in for real newlines — unescape them here.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local.",
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export async function verifyFirebaseIdToken(idToken: string) {
  return getAuth(getAdminApp()).verifyIdToken(idToken);
}
