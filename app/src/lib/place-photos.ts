// Freely licensed Wikimedia Commons photos of the starter places, keyed by place
// name. The licences require crediting the author and licence wherever shown.
export type CoverPhoto = { url: string; page: string; author: string; license: string };

let loading: Promise<Record<string, CoverPhoto>> | null = null;

export function loadCoverPhotos(): Promise<Record<string, CoverPhoto>> {
  loading ??= fetch('/place-photos.json')
    .then((response) => (response.ok ? response.json() : {}))
    .catch(() => {
      loading = null;
      return {};
    });
  return loading;
}

// Commons serves any width, so a 32px copy makes an instant blurred preview.
export function previewUrl(url: string): string {
  return url.replace(/width=\d+/, 'width=32');
}
