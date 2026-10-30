import { neon } from '@/lib/neon';

export type PlaceList = { id: string; owner_id: string; name: string; is_shared: boolean; place_ids: string[] };

type ListRow = { id: string; owner_id: string; name: string; is_shared: boolean; list_places: { place_id: string; position: number }[] };

function toList(row: ListRow): PlaceList {
  const places = [...row.list_places].sort((a, b) => a.position - b.position);
  return { id: row.id, owner_id: row.owner_id, name: row.name, is_shared: row.is_shared, place_ids: places.map((p) => p.place_id) };
}

const COLUMNS = 'id, owner_id, name, is_shared, list_places(place_id, position)';

export async function fetchMyLists(userId: string): Promise<PlaceList[]> {
  const { data, error } = await neon.from('lists').select(COLUMNS).eq('owner_id', userId).order('created_at');
  if (error) throw error;
  return ((data ?? []) as ListRow[]).map(toList);
}

// Readable by anyone once its owner has shared it.
export async function fetchList(listId: string): Promise<PlaceList | null> {
  const { data, error } = await neon.from('lists').select(COLUMNS).eq('id', listId).maybeSingle();
  if (error) throw error;
  return data ? toList(data as ListRow) : null;
}

export async function createList(name: string): Promise<PlaceList> {
  const { data, error } = await neon.from('lists').insert({ name: name.trim() }).select(COLUMNS).single();
  if (error) throw error;
  return toList(data as ListRow);
}

export async function deleteList(listId: string): Promise<void> {
  const { error } = await neon.from('lists').delete().eq('id', listId);
  if (error) throw error;
}

export async function setListShared(listId: string, shared: boolean): Promise<void> {
  const { error } = await neon.from('lists').update({ is_shared: shared }).eq('id', listId);
  if (error) throw error;
}

export async function addToList(list: PlaceList, placeId: string): Promise<void> {
  const { error } = await neon
    .from('list_places')
    .insert({ list_id: list.id, place_id: placeId, position: list.place_ids.length });
  if (error && error.code !== '23505') throw error;
}

export async function removeFromList(listId: string, placeId: string): Promise<void> {
  const { error } = await neon.from('list_places').delete().eq('list_id', listId).eq('place_id', placeId);
  if (error) throw error;
}

// Saves a new order, for example after reordering an itinerary.
export async function reorderList(listId: string, placeIds: string[]): Promise<void> {
  const results = await Promise.all(
    placeIds.map((placeId, position) =>
      neon.from('list_places').update({ position }).eq('list_id', listId).eq('place_id', placeId),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

export function listLink(listId: string): string {
  return `${window.location.origin}/discover?list=${listId}`;
}
