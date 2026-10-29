import { S3Client } from '@aws-sdk/client-s3';

// Neon Object Storage speaks the S3 protocol; its credentials stay server-side.
export const bucket = process.env.NEON_STORAGE_BUCKET ?? '';

export const storage = new S3Client({
  endpoint: process.env.NEON_STORAGE_ENDPOINT,
  region: process.env.NEON_STORAGE_REGION ?? 'auto',
  credentials: {
    accessKeyId: process.env.NEON_STORAGE_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.NEON_STORAGE_SECRET_ACCESS_KEY ?? '',
  },
  forcePathStyle: true,
});

// Asks the Data API, which validates the Neon Auth token, whose token this is.
export async function userIdFromRequest(request: Request): Promise<string | null> {
  const authorization = request.headers.get('authorization');
  if (!authorization) return null;
  const response = await fetch(`${process.env.EXPO_PUBLIC_NEON_DATA_API_URL}/rpc/current_user_id`, {
    method: 'POST',
    headers: { authorization, 'content-type': 'application/json' },
    body: '{}',
  });
  if (!response.ok) return null;
  const userId: unknown = await response.json();
  return typeof userId === 'string' && userId ? userId : null;
}
