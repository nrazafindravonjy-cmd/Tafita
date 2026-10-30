export const MIN_SIDE = 600;

export class PhotoTooSmallError extends Error {}

export type ProcessedPhoto = { blob: Blob; preview: string };

// Native photo uploads come with the native build; web processes photos in compress-image.web.ts.
export async function compressImage(_file: File): Promise<ProcessedPhoto> {
  throw new Error('Photo upload is only available on web for now.');
}
