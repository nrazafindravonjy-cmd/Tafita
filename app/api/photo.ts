import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { bucket, storage } from './_storage';

const PHOTO_KEY = /^places\/[0-9a-f-]{36}\/[\w-]+\/[0-9a-f-]{36}\.jpg$/i;

// Photos are public, so this redirects to a signed download URL for any valid key.
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key') ?? '';
  if (!PHOTO_KEY.test(key)) return new Response('Not found', { status: 404 });

  const url = await getSignedUrl(storage, new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: 3600,
  });
  return new Response(null, {
    status: 302,
    headers: { location: url, 'cache-control': 'public, max-age=3000' },
  });
}
