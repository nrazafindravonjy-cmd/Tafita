// Native photo uploads come with the MapLibre Native work; web resizes below.
export async function compressImage(_file: File): Promise<Blob> {
  throw new Error('Photo upload is only available on web for now.');
}
