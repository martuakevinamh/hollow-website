import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = (await headers()).get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    const requesterRole = decodedToken.role || 'utama';
    if (requesterRole !== 'utama') {
      return NextResponse.json({ error: 'Forbidden: Only Admin Utama can list other admins' }, { status: 403 });
    }

    // List all users from Firebase Auth
    const listUsersResult = await adminAuth.listUsers(100);
    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime,
      lastLogin: user.metadata.lastSignInTime,
      role: user.customClaims?.role || 'utama', // Default to 'utama' if claims are empty
    }));

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('Error listing admins:', err);
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = (await headers()).get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    const requesterRole = decodedToken.role || 'utama';
    if (requesterRole !== 'utama') {
      return NextResponse.json({ error: 'Forbidden: Only Admin Utama can create admins' }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Email and password (min 6 chars) are required' }, { status: 400 });
    }

    const targetRole = role === 'utama' ? 'utama' : 'sekunder';

    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    // Set custom user claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: targetRole });

    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        role: targetRole,
        createdAt: userRecord.metadata.creationTime,
      },
    });
  } catch (err: any) {
    console.error('Error creating admin:', err);
    return NextResponse.json({ error: err.message || 'Failed to create admin' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = (await headers()).get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    const requesterRole = decodedToken.role || 'utama';
    if (requesterRole !== 'utama') {
      return NextResponse.json({ error: 'Forbidden: Only Admin Utama can delete admins' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'User UID is required' }, { status: 400 });
    }

    if (uid === decodedToken.uid) {
      return NextResponse.json({ error: 'You cannot delete your own admin account!' }, { status: 400 });
    }

    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting admin:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete admin' }, { status: 500 });
  }
}
