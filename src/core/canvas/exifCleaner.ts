import { ExifReport } from '../../types/studio';

/**
 * Inspects a binary ArrayBuffer for standard EXIF / TIFF markers in JPEG files.
 * Extracts detected tag categories (GPS, Camera, Dates) for user reporting.
 */
export function inspectExifMetadata(buffer: ArrayBuffer): { hasExif: boolean; tags: string[] } {
  const view = new DataView(buffer);
  const tags: string[] = [];
  let hasExif = false;

  // JPEG SOI check (0xFFD8)
  if (view.byteLength > 4 && view.getUint16(0, false) === 0xffd8) {
    let offset = 2;
    while (offset < view.byteLength - 4) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      // APP1 Marker (0xFFE1) -> Standard EXIF container
      if (marker === 0xffe1) {
        hasExif = true;
        const length = view.getUint16(offset, false);
        const header = String.fromCharCode(
          view.getUint8(offset + 2),
          view.getUint8(offset + 3),
          view.getUint8(offset + 4),
          view.getUint8(offset + 5)
        );

        if (header === 'Exif') {
          tags.push('EXIF Header (TIFF Data)');
          
          // Simple scan inside EXIF segment for GPS / Camera tags
          const exifDataOffset = offset + 8;
          const exifString = new Uint8Array(buffer, exifDataOffset, Math.min(length, 1024));
          const textChunk = new TextDecoder('latin1').decode(exifString);

          if (/GPS|GPSLatitude|GPSLongitude/i.test(textChunk) || textChunk.includes('GPS')) {
            tags.push('GPS Geolocation Coordinates');
          }
          if (/Apple|Samsung|Canon|Sony|Nikon|Google|Huawei/i.test(textChunk)) {
            tags.push('Camera Device / Lens Maker');
          }
          if (/\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/.test(textChunk)) {
            tags.push('Creation DateTime Timestamp');
          }
          if (tags.length === 1) {
            tags.push('Camera Parameters / Orientation / Thumbnail');
          }
        }
        break;
      } else if ((marker & 0xff00) !== 0xff00 || marker === 0xffda) {
        // Stop scanning at Start of Scan (SOS)
        break;
      } else {
        const length = view.getUint16(offset, false);
        offset += length;
      }
    }
  }

  // PNG check for tEXt / zTXt / eXIf chunks
  if (view.byteLength > 8 && view.getUint32(0, false) === 0x89504e47) {
    const pngText = new TextDecoder('latin1').decode(new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 4096)));
    if (pngText.includes('eXIf') || pngText.includes('tEXt') || pngText.includes('zTXt')) {
      hasExif = true;
      tags.push('PNG Embedded Metadata / Comments');
    }
  }

  return { hasExif, tags };
}

/**
 * Client-Side EXIF Stripping Pipeline:
 * Decodes the image via standard browser image pipeline, draws to an isolated canvas,
 * and re-encodes it into a pristine DataURL without preserving any metadata headers.
 */
export async function sanitizeImageFile(file: File): Promise<{
  sanitizedUrl: string;
  report: ExifReport;
  originalWidth: number;
  originalHeight: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const { hasExif, tags } = inspectExifMetadata(arrayBuffer);

  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer], { type: file.type || 'image/png' });
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // Downscale ultra-massive images to prevent memory crash (max 4096px on long edge)
        const maxDimension = 4096;
        let targetWidth = width;
        let targetHeight = height;

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            targetWidth = maxDimension;
            targetHeight = Math.round((height * maxDimension) / width);
          } else {
            targetHeight = maxDimension;
            targetWidth = Math.round((width * maxDimension) / height);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { alpha: true });

        if (!ctx) {
          throw new Error('Could not create canvas 2d context for image sanitization');
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Export as clean PNG data URL (or JPEG if original was JPEG without alpha)
        const isPng = file.type === 'image/png';
        const sanitizedUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.95);

        // Approximate sanitized byte size from Base64 string length
        const sanitizedSizeBytes = Math.round((sanitizedUrl.length * 3) / 4);

        const report: ExifReport = {
          hasExif,
          tagsFound: tags.length > 0 ? tags : (hasExif ? ['EXIF Metadata Block'] : ['None']),
          gpsPurged: tags.some(t => t.includes('GPS')),
          cameraInfoPurged: tags.some(t => t.includes('Camera')),
          timestampPurged: tags.some(t => t.includes('DateTime') || t.includes('Timestamp')),
          sanitizedSizeBytes,
        };

        URL.revokeObjectURL(objectUrl);
        resolve({
          sanitizedUrl,
          report,
          originalWidth: targetWidth,
          originalHeight: targetHeight,
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image file. File may be corrupted or unsupported.'));
    };

    img.src = objectUrl;
  });
}
