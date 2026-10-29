import type { Language } from '@/i18n';
import { neon } from '@/lib/neon';

export type PlaceDetails = {
  id: string;
  name: string;
  region: string | null;
  description_fr: string | null;
  description_en: string | null;
};

export type Review = {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  author: { username: string } | null;
};

export async function fetchPlace(placeId: string): Promise<PlaceDetails> {
  const { data, error } = await neon
    .from('places')
    .select('id, name, region, description_fr, description_en')
    .eq('id', placeId)
    .single();
  if (error) throw error;
  return data as PlaceDetails;
}

export async function fetchReviews(placeId: string): Promise<Review[]> {
  const { data, error } = await neon
    .from('reviews')
    .select('id, rating, body, created_at, author:profiles(username)')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Review[];
}

export async function fetchPhotoKeys(placeId: string): Promise<string[]> {
  const { data, error } = await neon
    .from('place_photos')
    .select('storage_key')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => (row as { storage_key: string }).storage_key);
}

export function photoUrl(key: string): string {
  return `/api/photo?key=${encodeURIComponent(key)}`;
}

type NewReview = { placeId: string; authorId: string; rating: number; body: string; language: Language };

export async function createReview({ placeId, authorId, rating, body, language }: NewReview): Promise<void> {
  const { error } = await neon.from('reviews').insert({
    place_id: placeId,
    author_id: authorId,
    rating,
    body: body.trim() || null,
    language,
  });
  if (error) throw error;
}

// Uploads a JPEG through a signed URL from our API, then records it for the place.
export async function uploadPhoto(placeId: string, userId: string, photo: Blob): Promise<void> {
  const token = (await neon.auth.getSession()).data?.session.token;
  if (!token) throw new Error('not signed in');

  const response = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ placeId }),
  });
  if (!response.ok) throw new Error(`upload url: ${response.status}`);
  const { key, url } = (await response.json()) as { key: string; url: string };

  const upload = await fetch(url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: photo });
  if (!upload.ok) throw new Error(`upload: ${upload.status}`);

  const { error } = await neon.from('place_photos').insert({ place_id: placeId, storage_key: key, uploaded_by: userId });
  if (error) throw error;
}
