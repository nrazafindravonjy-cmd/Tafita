import { callApi } from '@/lib/api';
import { neon } from '@/lib/neon';

// Deletes the member's photos (files and rows), then their profile, which
// cascades to their reviews and reports, then their sign-in account.
// Returns false when Neon Auth refuses to delete the sign-in account itself.
export async function deleteAccount(userId: string): Promise<boolean> {
  const { data, error } = await neon.from('place_photos').select('storage_key').eq('uploaded_by', userId);
  if (error) throw error;
  const keys = ((data ?? []) as { storage_key: string }[]).map((row) => row.storage_key);
  if (keys.length) await callApi('/api/delete-photos', { keys });

  const photos = await neon.from('place_photos').delete().eq('uploaded_by', userId);
  if (photos.error) throw photos.error;
  const profile = await neon.from('profiles').delete().eq('id', userId);
  if (profile.error) throw profile.error;

  const result = await neon.auth.deleteUser().catch(() => ({ error: true }));
  await neon.auth.signOut().catch(() => {});
  return !result.error;
}
