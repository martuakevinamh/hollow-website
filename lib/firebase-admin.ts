import * as admin from 'firebase-admin';

// Firebase Admin SDK — server-side only (API routes, middleware)
// Lazy initialization agar aman saat Next.js build time jika env belum terisi

function getAdminAuth(): admin.auth.Auth {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase Admin credentials tidak lengkap (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return admin.auth();
}

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    const authRecord = auth as unknown as Record<string | symbol, unknown>;
    const val = authRecord[prop];
    return typeof val === 'function' ? (val as (...args: unknown[]) => unknown).bind(auth) : val;
  },
});

export default admin;
