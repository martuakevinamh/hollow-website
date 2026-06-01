import * as admin from 'firebase-admin';

// Firebase Admin SDK — server-side only (API routes, middleware)
// Verifies ID tokens dari client untuk memproteksi admin routes.

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Newline dari env var perlu di-replace
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = admin.auth();
export default admin;
