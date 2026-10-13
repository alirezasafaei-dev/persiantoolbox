import sharp from 'sharp';
import { ImageError, identifyImage } from './core.mjs';

// Decode untrusted downloads, bound allocation before decoding, and strip metadata.
export async function validateGeneratedDownload(bytes, displayed, { sanitize = true } = {}) {
  try {
    const mime = identifyImage(bytes);
    const image = sharp(bytes, {
      failOn: 'warning',
      limitInputPixels: 2048 * 2048,
      limitInputChannels: 4,
    });
    const metadata = await image.metadata();
    const { width, height } = metadata;
    if (
      ![width, height].every((value) => Number.isInteger(value) && value > 0 && value <= 2048) ||
      (metadata.pages ?? 1) !== 1 ||
      (displayed && (displayed.width !== width || displayed.height !== height))
    ) {
      throw new ImageError('invalid_image');
    }
    const format = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' }[mime];
    if (metadata.format !== format) throw new ImageError('invalid_image');
    // Decode in the browser; sanitize only once at the worker trust boundary.
    let clean = bytes;
    if (sanitize) clean = await image.timeout({ seconds: 5 }).toFormat(format).toBuffer();
    else await image.timeout({ seconds: 5 }).raw().toBuffer();
    identifyImage(clean);
    return { bytes: clean, mime, width, height };
  } catch {
    throw new ImageError('invalid_image');
  }
}
