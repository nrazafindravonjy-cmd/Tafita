export type GeocodeResult = {
  name: string;
  lat: number;
  lng: number;
  // [south, north, west, east], when the place covers an area.
  bounds: [number, number, number, number] | null;
};

type NominatimPlace = { display_name: string; lat: string; lon: string; boundingbox?: string[] };

// Nominatim (OpenStreetMap) is free but forbids search-as-you-type, so callers
// must only search when the user submits.
export async function searchMadagascar(query: string, language: string): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    countrycodes: 'mg',
    limit: '5',
    'accept-language': language,
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
  if (!response.ok) throw new Error(`geocode: ${response.status}`);
  const places = (await response.json()) as NominatimPlace[];
  return places.map((place) => ({
    name: place.display_name,
    lat: Number(place.lat),
    lng: Number(place.lon),
    bounds: place.boundingbox?.length === 4 ? (place.boundingbox.map(Number) as GeocodeResult['bounds']) : null,
  }));
}
