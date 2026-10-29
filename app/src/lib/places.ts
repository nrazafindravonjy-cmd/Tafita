import { neon } from '@/lib/neon';

export type PlaceMarker = {
  id: string;
  name: string;
  region: string | null;
  category_slug: string;
  lat: number;
  lng: number;
};

export async function fetchPlaceMarkers(): Promise<PlaceMarker[]> {
  const { data, error } = await neon
    .from('place_markers')
    .select('id, name, region, category_slug, lat, lng');
  if (error) throw error;
  return (data ?? []) as PlaceMarker[];
}
