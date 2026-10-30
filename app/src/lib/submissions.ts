import { neon } from '@/lib/neon';

export type PlaceStatus = 'pending' | 'published' | 'rejected';

export type Submission = {
  id: string;
  name: string;
  region: string | null;
  description_fr: string | null;
  description_en: string | null;
  status: PlaceStatus;
  created_at: string;
  category_slug: string;
  author_username: string | null;
  lat: number;
  lng: number;
};

export type Category = { id: number; slug: string; name_fr: string; name_en: string };

const COLUMNS =
  'id, name, region, description_fr, description_en, status, created_at, category_slug, author_username, lat, lng';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await neon.from('categories').select('id, slug, name_fr, name_en').order('id');
  if (error) throw error;
  return (data ?? []) as Category[];
}

type NewPlace = {
  userId: string;
  categoryId: number;
  name: string;
  region: string;
  description: string;
  language: 'fr' | 'en';
  lat: number;
  lng: number;
};

// Row-level security only accepts pending places created by the signed-in user.
export async function proposePlace(place: NewPlace): Promise<void> {
  const description = place.description.trim() || null;
  const { error } = await neon.from('places').insert({
    category_id: place.categoryId,
    name: place.name.trim(),
    region: place.region.trim() || null,
    description_fr: place.language === 'fr' ? description : null,
    description_en: place.language === 'en' ? description : null,
    // PostGIS parses extended WKT, so the Data API can write the point as text.
    location: `SRID=4326;POINT(${place.lng.toFixed(6)} ${place.lat.toFixed(6)})`,
    created_by: place.userId,
    status: 'pending',
  });
  if (error) throw error;
}

export async function fetchMySubmissions(userId: string): Promise<Submission[]> {
  const { data, error } = await neon
    .from('place_submissions')
    .select(COLUMNS)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Submission[];
}

export async function fetchPendingSubmissions(): Promise<Submission[]> {
  const { data, error } = await neon
    .from('place_submissions')
    .select(COLUMNS)
    .eq('status', 'pending')
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as Submission[];
}

export async function moderatePlace(placeId: string, status: 'published' | 'rejected'): Promise<void> {
  const { error } = await neon.from('places').update({ status }).eq('id', placeId);
  if (error) throw error;
}
