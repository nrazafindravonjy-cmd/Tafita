import { DeleteObjectsCommand } from '@aws-sdk/client-s3';

import { bucket, storage, userIdFromRequest } from './_storage';

// Members delete their own photo files; moderators may delete any.
export async function POST(request: Request) {
  const userId = await userIdFromRequest(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { keys } = (await request.json().catch(() => ({}))) as { keys?: unknown };
  if (!Array.isArray(keys) || keys.length === 0 || keys.length > 200 || !keys.every((key) => typeof key === 'string')) {
    return Response.json({ error: 'invalid keys' }, { status: 400 });
  }
  const own = keys.every((key) => key.split('/')[2] === userId);
  if (!own && !(await isModerator(request))) return Response.json({ error: 'forbidden' }, { status: 403 });

  await storage.send(
    new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true } }),
  );
  return Response.json({ deleted: keys.length });
}

async function isModerator(request: Request): Promise<boolean> {
  const response = await fetch(`${process.env.EXPO_PUBLIC_NEON_DATA_API_URL}/rpc/is_moderator`, {
    method: 'POST',
    headers: { authorization: request.headers.get('authorization') ?? '', 'content-type': 'application/json' },
    body: '{}',
  });
  return response.ok && (await response.json()) === true;
}
