import { StudioTemplate, ImageFitMode, ImageFilters, StickerLayer, BorderFrame, Watermark } from '../../types/studio';
import { renderTextLayer } from './textEngine';

// In-memory image element cache to avoid recreating Image instances on every render tick
const imageElementCache = new Map<string, HTMLImageElement>();

export function getImageFromCache(url: string): HTMLImageElement | null {
  if (!url) return null;
  const cached = imageElementCache.get(url);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return cached;
  }
  return null;
}

export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('Empty image URL'));
      return;
    }
    const existing = imageElementCache.get(url);
    if (existing && existing.complete && existing.naturalWidth > 0) {
      resolve(existing);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageElementCache.set(url, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/**
 * Builds CSS filter string for 2D Canvas context
 */
export function buildCanvasFilterString(filters: ImageFilters): string {
  const parts: string[] = [];
  if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturation !== 100) parts.push(`saturate(${filters.saturation}%)`);
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`);
  if (filters.invert > 0) parts.push(`invert(${filters.invert}%)`);
  if (filters.hueRotate > 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
}

/**
 * Renders the background (Color, Gradient, or Image)
 */
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  template: StudioTemplate,
  width: number,
  height: number
) {
  const bg = template.background;

  // 1. Clear canvas
  ctx.clearRect(0, 0, width, height);

  // 2. Base Fill
  if (bg.type === 'color') {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'gradient') {
    const angleRad = (bg.gradient.angle * Math.PI) / 180;
    let gradient: CanvasGradient;

    if (bg.gradient.type === 'linear') {
      const cx = width / 2;
      const cy = height / 2;
      const length = Math.sqrt(width * width + height * height) / 2;
      const x0 = cx - Math.cos(angleRad) * length;
      const y0 = cy - Math.sin(angleRad) * length;
      const x1 = cx + Math.cos(angleRad) * length;
      const y1 = cy + Math.sin(angleRad) * length;

      gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    } else {
      gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2
      );
    }

    gradient.addColorStop(0, bg.gradient.colors[0]);
    gradient.addColorStop(1, bg.gradient.colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'transparent') {
    // Leave blank for transparent export
  }

  // 3. Image Background
  if (bg.image.url) {
    const img = getImageFromCache(bg.image.url);
    if (img) {
      renderBackgroundImage(ctx, img, bg.image, width, height);
    }
  }
}

/**
 * Renders background image with cover/contain math, zoom, flip, rotation, and filters
 */
function renderBackgroundImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  imageState: StudioTemplate['background']['image'],
  canvasWidth: number,
  canvasHeight: number
) {
  const imgWidth = img.naturalWidth || img.width;
  const imgHeight = img.naturalHeight || img.height;
  if (!imgWidth || !imgHeight) return;

  ctx.save();

  // Apply CSS Filters
  ctx.filter = buildCanvasFilterString(imageState.filters);

  // Compute scale and position based on fit mode
  let renderWidth = canvasWidth;
  let renderHeight = canvasHeight;
  let renderX = 0;
  let renderY = 0;

  const scaleX = canvasWidth / imgWidth;
  const scaleY = canvasHeight / imgHeight;

  if (imageState.fit === 'cover') {
    const scale = Math.max(scaleX, scaleY) * imageState.zoom;
    renderWidth = imgWidth * scale;
    renderHeight = imgHeight * scale;
    renderX = (canvasWidth - renderWidth) / 2 + (imageState.offsetX / 100) * canvasWidth;
    renderY = (canvasHeight - renderHeight) / 2 + (imageState.offsetY / 100) * canvasHeight;
  } else if (imageState.fit === 'contain') {
    const scale = Math.min(scaleX, scaleY) * imageState.zoom;
    renderWidth = imgWidth * scale;
    renderHeight = imgHeight * scale;
    renderX = (canvasWidth - renderWidth) / 2 + (imageState.offsetX / 100) * canvasWidth;
    renderY = (canvasHeight - renderHeight) / 2 + (imageState.offsetY / 100) * canvasHeight;
  } else if (imageState.fit === 'fill' || imageState.fit === 'stretch') {
    renderWidth = canvasWidth * imageState.zoom;
    renderHeight = canvasHeight * imageState.zoom;
    renderX = (canvasWidth - renderWidth) / 2 + (imageState.offsetX / 100) * canvasWidth;
    renderY = (canvasHeight - renderHeight) / 2 + (imageState.offsetY / 100) * canvasHeight;
  }

  // Handle Flip & Rotation
  const centerX = renderX + renderWidth / 2;
  const centerY = renderY + renderHeight / 2;

  ctx.translate(centerX, centerY);

  if (imageState.rotation !== 0) {
    ctx.rotate((imageState.rotation * Math.PI) / 180);
  }
  if (imageState.flipH || imageState.flipV) {
    ctx.scale(imageState.flipH ? -1 : 1, imageState.flipV ? -1 : 1);
  }

  ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);

  ctx.restore();

  // Draw Vignette overlay if enabled
  if (imageState.filters.vignette > 0) {
    ctx.save();
    const radial = ctx.createRadialGradient(
      canvasWidth / 2,
      canvasHeight / 2,
      Math.min(canvasWidth, canvasHeight) * 0.3,
      canvasWidth / 2,
      canvasHeight / 2,
      Math.max(canvasWidth, canvasHeight) * 0.7
    );
    const alpha = (imageState.filters.vignette / 100) * 0.85;
    radial.addColorStop(0, 'rgba(0,0,0,0)');
    radial.addColorStop(1, `rgba(0,0,0,${alpha})`);
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }
}

/**
 * Renders decorative frame border
 */
export function renderBorderFrame(
  ctx: CanvasRenderingContext2D,
  frame: BorderFrame,
  width: number,
  height: number
) {
  if (!frame.enabled || frame.width <= 0) return;

  ctx.save();
  ctx.strokeStyle = frame.color;
  ctx.lineWidth = frame.width;

  if (frame.style === 'dashed') {
    ctx.setLineDash([frame.width * 2, frame.width]);
  }

  const x = frame.inset + frame.width / 2;
  const y = frame.inset + frame.width / 2;
  const w = width - (frame.inset + frame.width / 2) * 2;
  const h = height - (frame.inset + frame.width / 2) * 2;

  if (frame.radius > 0) {
    const r = Math.min(frame.radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.strokeRect(x, y, w, h);
  }

  ctx.restore();
}

/**
 * Renders watermark
 */
export function renderWatermark(
  ctx: CanvasRenderingContext2D,
  watermark: Watermark,
  width: number,
  height: number
) {
  if (!watermark.enabled || !watermark.text.trim()) return;

  ctx.save();
  ctx.globalAlpha = watermark.opacity;
  ctx.font = `600 ${watermark.fontSize}px ${watermark.fontFamily}, sans-serif`;
  ctx.fillStyle = watermark.color;

  const padding = 30;

  if (watermark.position === 'bottom-right') {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(watermark.text, width - padding, height - padding);
  } else if (watermark.position === 'bottom-left') {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(watermark.text, padding, height - padding);
  } else if (watermark.position === 'top-right') {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(watermark.text, width - padding, padding);
  } else if (watermark.position === 'top-left') {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(watermark.text, padding, padding);
  } else if (watermark.position === 'center') {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(watermark.text, width / 2, height / 2);
  }

  ctx.restore();
}

/**
 * Renders stickers and emojis
 */
export function renderSticker(
  ctx: CanvasRenderingContext2D,
  sticker: StickerLayer
) {
  if (!sticker.visible) return;

  ctx.save();
  ctx.globalAlpha = sticker.opacity;
  ctx.translate(sticker.x, sticker.y);

  if (sticker.rotation !== 0) {
    ctx.rotate((sticker.rotation * Math.PI) / 180);
  }

  if (sticker.type === 'emoji') {
    ctx.font = `${sticker.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.content, 0, 0);
  }

  ctx.restore();
}

/**
 * Primary Render Pipeline: Renders the entire studio state onto any target canvas
 */
export function renderStudioCanvas(
  ctx: CanvasRenderingContext2D,
  template: StudioTemplate,
  targetWidth?: number,
  targetHeight?: number
) {
  const width = targetWidth ?? template.dimensions.width;
  const height = targetHeight ?? template.dimensions.height;

  // 1. Background
  renderBackground(ctx, template, width, height);

  // 2. Stickers (below text by zIndex)
  const allStickers = [...template.stickers].sort((a, b) => a.zIndex - b.zIndex);
  for (const sticker of allStickers) {
    renderSticker(ctx, sticker);
  }

  // 3. Text Layers (sorted by zIndex)
  const allTextLayers = [...template.textLayers].sort((a, b) => a.zIndex - b.zIndex);
  for (const layer of allTextLayers) {
    renderTextLayer(ctx, layer, width, height);
  }

  // 4. Border Frame
  renderBorderFrame(ctx, template.frame, width, height);

  // 5. Watermark
  renderWatermark(ctx, template.watermark, width, height);
}
