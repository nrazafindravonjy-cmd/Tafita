const MAX_SIDE = 1600;
// Below this, a photo looks blurry full screen whatever we do to it.
export const MIN_SIDE = 600;

export class PhotoTooSmallError extends Error {}

export type ProcessedPhoto = { blob: Blob; preview: string };

// Runs once on the uploader's device, so viewers only ever download a small,
// already corrected JPEG and a ~1 KB blurred preview.
export async function compressImage(file: File): Promise<ProcessedPhoto> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  if (Math.min(bitmap.width, bitmap.height) < MIN_SIDE) {
    bitmap.close();
    throw new PhotoTooSmallError();
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  enhance(canvas, context);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('compression failed'))), 'image/jpeg', 0.82),
  );
  return { blob, preview: tinyPreview(canvas) };
}

// Stretches dull or dark exposures, adds a touch of colour, then sharpens.
function enhance(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  const { width, height } = canvas;
  const image = context.getImageData(0, 0, width, height);
  const pixels = image.data;

  // Clip the darkest and brightest 0.5% of luminance before stretching, so a
  // single speck of white or black does not cancel the correction.
  const histogram = new Uint32Array(256);
  for (let i = 0; i < pixels.length; i += 4) {
    histogram[(pixels[i] * 77 + pixels[i + 1] * 150 + pixels[i + 2] * 29) >> 8]++;
  }
  const total = width * height;
  let low = 0;
  let high = 255;
  for (let sum = 0; low < 255 && (sum += histogram[low]) < total * 0.005; low++);
  for (let sum = 0; high > 0 && (sum += histogram[high]) < total * 0.005; high--);
  // Leave well-exposed photos alone and never stretch more than 1.6x.
  const range = Math.max(high - low, 160);
  const gain = 255 / range;
  const saturation = 1.08;

  for (let i = 0; i < pixels.length; i += 4) {
    let r = (pixels[i] - low) * gain;
    let g = (pixels[i + 1] - low) * gain;
    let b = (pixels[i + 2] - low) * gain;
    const grey = r * 0.3 + g * 0.59 + b * 0.11;
    r = grey + (r - grey) * saturation;
    g = grey + (g - grey) * saturation;
    b = grey + (b - grey) * saturation;
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
  }
  context.putImageData(image, 0, 0);

  // Unsharp mask: add back a fraction of the detail a slight blur removes.
  const blurred = document.createElement('canvas');
  blurred.width = width;
  blurred.height = height;
  const blurContext = blurred.getContext('2d')!;
  blurContext.filter = 'blur(1.2px)';
  blurContext.drawImage(canvas, 0, 0);
  const soft = blurContext.getImageData(0, 0, width, height).data;
  const sharp = context.getImageData(0, 0, width, height);
  const amount = 0.45;
  for (let i = 0; i < sharp.data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const value = sharp.data[i + c];
      sharp.data[i + c] = value + (value - soft[i + c]) * amount;
    }
  }
  context.putImageData(sharp, 0, 0);
}

function tinyPreview(source: HTMLCanvasElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = Math.max(1, Math.round((24 * source.height) / source.width));
  canvas.getContext('2d')!.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.5);
}
