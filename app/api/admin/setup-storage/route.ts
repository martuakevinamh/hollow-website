import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const REQUIRED_BUCKETS = [
  { name: 'gallery-images', public: true },
  { name: 'member-photos', public: true },
];

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.' },
      { status: 500 }
    );
  }

  // Use service role client — needed to create buckets
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const results: { bucket: string; status: string; message: string }[] = [];

  for (const bucket of REQUIRED_BUCKETS) {
    // Check if bucket already exists
    const { data: existing } = await adminClient.storage.getBucket(bucket.name);

    if (existing) {
      results.push({ bucket: bucket.name, status: 'exists', message: 'Bucket already exists' });
      continue;
    }

    // Create the bucket
    const { error } = await adminClient.storage.createBucket(bucket.name, {
      public: bucket.public,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
    });

    if (error) {
      results.push({ bucket: bucket.name, status: 'error', message: error.message });
    } else {
      results.push({ bucket: bucket.name, status: 'created', message: 'Bucket created successfully' });
    }
  }

  const hasError = results.some((r) => r.status === 'error');
  return NextResponse.json({ results }, { status: hasError ? 500 : 200 });
}
