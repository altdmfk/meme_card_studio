import JSZip from 'jszip';
import { StudioTemplate, ExportOptions, BatchItem } from '../../types/studio';
import { renderStudioCanvas, preloadImage } from './CanvasRenderer';

/**
 * Renders the studio template to an isolated Offscreen / In-memory canvas at target scale
 */
export async function renderTemplateToCanvas(
  template: StudioTemplate,
  scaleMultiplier: number = 1
): Promise<HTMLCanvasElement> {
  // Ensure background image is loaded
  if (template.background.image.url) {
    try {
      await preloadImage(template.background.image.url);
    } catch (e) {
      console.warn('Could not preload background image during export', e);
    }
  }

  // Ensure document fonts are ready
  if ('fonts' in document) {
    await document.fonts.ready;
  }

  const exportCanvas = document.createElement('canvas');
  const targetWidth = Math.round(template.dimensions.width * scaleMultiplier);
  const targetHeight = Math.round(template.dimensions.height * scaleMultiplier);

  exportCanvas.width = targetWidth;
  exportCanvas.height = targetHeight;

  const ctx = exportCanvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('Failed to create 2D rendering context for export');
  }

  // Apply resolution scale
  ctx.scale(scaleMultiplier, scaleMultiplier);

  // Render the entire studio state at normalized logical dimensions
  renderStudioCanvas(ctx, template, template.dimensions.width, template.dimensions.height);

  return exportCanvas;
}

/**
 * Exports the studio template directly to a Blob with exact MIME type and quality
 */
export async function exportStudioToBlob(
  template: StudioTemplate,
  options: ExportOptions
): Promise<Blob> {
  const canvas = await renderTemplateToCanvas(template, options.scaleMultiplier);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob conversion failed'));
        }
      },
      options.format,
      options.quality
    );
  });
}

/**
 * Downloads a Blob directly to the user's computer
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copies the rendered graphic directly to the system clipboard
 */
export async function copyCanvasToClipboard(
  template: StudioTemplate,
  scaleMultiplier: number = 2
): Promise<void> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard API is not supported in this browser');
  }

  const blob = await exportStudioToBlob(template, {
    format: 'image/png',
    quality: 1,
    scaleMultiplier,
    filename: 'clipboard.png',
    includeWatermark: template.watermark.enabled,
  });

  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
}

/**
 * Batch Image Generator: Renders multiple card variations from a template and packages into a ZIP
 */
export async function generateBatchArchive(
  baseTemplate: StudioTemplate,
  batchItems: BatchItem[],
  options: ExportOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<{ zipBlob: Blob; renderedCount: number }> {
  const zip = new JSZip();
  let completed = 0;

  for (let i = 0; i < batchItems.length; i++) {
    const item = batchItems[i];
    
    // Create clone of base template with text overrides
    const clonedTemplate: StudioTemplate = JSON.parse(JSON.stringify(baseTemplate));

    // Apply text overrides by layer ID or sequential index
    for (const [layerId, text] of Object.entries(item.textOverrides)) {
      const targetLayer = clonedTemplate.textLayers.find(l => l.id === layerId);
      if (targetLayer) {
        targetLayer.text = text;
      }
    }

    if (item.imageUrlOverride) {
      clonedTemplate.background.image.url = item.imageUrlOverride;
      try {
        await preloadImage(item.imageUrlOverride);
      } catch (e) {
        console.warn('Failed to load batch item image override', e);
      }
    }

    const blob = await exportStudioToBlob(clonedTemplate, options);
    const ext = options.format === 'image/jpeg' ? 'jpg' : options.format === 'image/webp' ? 'webp' : 'png';
    const cleanFilename = (item.filename || `card_${i + 1}`).replace(/[\\/:*?"<>|]/g, '_');
    
    zip.file(`${cleanFilename}.${ext}`, blob);

    completed++;
    if (onProgress) {
      onProgress(completed, batchItems.length);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return { zipBlob, renderedCount: completed };
}
