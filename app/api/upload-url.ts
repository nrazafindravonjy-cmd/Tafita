import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { bucket, storage, userIdFromRequest } from './_storage';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Returns a short-lived URL the browser uploads one JPEG photo to.
export async function POST(request: Request) {
  const userId = await userIdFromRequest(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { placeId } = (await request.json().catch(() => ({}))) as { placeId?: string };
  if (!placeId || !UUID.test(placeId)) return Response.json({ error: 'invalid place' }, { status: 400 });

  const key = `places/${placeId}/${userId}/${crypto.randomUUID()}.jpg`;
  const url = await getSignedUrl(
    storage,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: 'image/jpeg' }),
    { expiresIn: 300 },
  );
  return Response.json({ key, url });
}
