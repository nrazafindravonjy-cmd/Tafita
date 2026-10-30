import { neon } from '@/lib/neon';

// Calls one of the app's own Vercel functions as the signed-in user.
export async function callApi<T>(path: string, body: unknown): Promise<T> {
  const token = (await neon.auth.getSession()).data?.session.token;
  if (!token) throw new Error('not signed in');
  const response = await fetch(path, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return (await response.json()) as T;
}
