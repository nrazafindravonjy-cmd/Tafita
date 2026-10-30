import { neon } from '@/lib/neon';

export async function fetchVisitedIds(userId: string): Promise<Set<string>> {
  const { data, error } = await neon.from('visits').select('place_id').eq('user_id', userId);
  if (error) throw error;
  return new Set(((data ?? []) as { place_id: string }[]).map((row) => row.place_id));
}

export async function setVisited(userId: string, placeId: string, visited: boolean): Promise<void> {
  const { error } = visited
    ? await neon.from('visits').insert({ place_id: placeId })
    : await neon.from('visits').delete().eq('user_id', userId).eq('place_id', placeId);
  if (error && error.code !== '23505') throw error;
}
