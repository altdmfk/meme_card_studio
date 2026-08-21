export type AspectRatioType = 
  | '1:1' 
  | '4:5' 
  | '9:16' 
  | '16:9' 
  | '4:3' 
  | '3:4' 
  | '2:1' 
  | 'custom';

export type StudioTabType = 'canvas' | 'text' | 'decorations' | 'templates';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export type ImageFitMode = 'cover' | 'contain' | 'fill' | 'stretch';

export interface ImageFilters {
  brightness: number; // 0 to 200, default 100
  contrast: number;   // 0 to 200, default 100
  saturation: number; // 0 to 200, default 100
  blur: number;       // 0 to 50, default 0
  grayscale: number;  // 0 to 100, default 0
  sepia: number;      // 0 to 100, default 0
  invert: number;     // 0 to 100, default 0
  hueRotate: number;  // 0 to 360, default 0
  vignette: number;   // 0 to 100, default 0
}

export interface BackgroundState {
  type: 'color' | 'gradient' | 'image' | 'transparent';
  color: string;
  gradient: {
    type: 'linear' | 'radial';
    colors: [string, string];
    angle: number; // in degrees
  };
  image: {
    url: string | null;
    originalName?: string;
    fit: ImageFitMode;
    offsetX: number; // percentage (-100 to 100)
    offsetY: number; // percentage (-100 to 100)
    zoom: number;    // 0.1 to 5, default 1
    rotation: number;// 0, 90, 180, 270
    flipH: boolean;
    flipV: boolean;
    filters: ImageFilters;
    exifStripped?: boolean;
    rawExifFound?: string[];
  };
}

export interface TextBackgroundBox {
  enabled: boolean;
  color: string;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
}

export interface TextShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface TextLayer {
  id: string;
  name: string;
  text: string;
  // Position coordinates in virtual canvas pixels (0 to canvas.width / canvas.height)
  x: number;
  y: number;
  rotation: number; // degrees
  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal';
  fontStyle: 'normal' | 'italic';
  color: string;
  opacity: number; // 0 to 1
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  lineHeight: number; // e.g. 1.2
  letterSpacing: number; // e.g. 0 to 20
  transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  // Stroke / Outline
  strokeWidth: number;
  strokeColor: string;
  // Shadow
  shadow: TextShadow;
  // Background Pill / Box
  backgroundBox: TextBackgroundBox;
  // Layout bounds & safety
  maxWidth?: number;
  maxHeight?: number;
  autoScale: boolean; // Auto-shrink font size if text overflows maxWidth/maxHeight
  // State
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

export interface StickerLayer {
  id: string;
  type: 'emoji' | 'badge' | 'shape';
  content: string; // Emoji character or SVG path/preset
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

export interface BorderFrame {
  enabled: boolean;
  color: string;
  width: number;
  inset: number;
  radius: number;
  style: 'solid' | 'dashed' | 'double';
}

export interface Watermark {
  enabled: boolean;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'pattern';
}

export interface StudioTemplate {
  id: string;
  version: string;
  name: string;
  category: 'meme' | 'social' | 'minimal' | 'news' | 'quote' | 'custom';
  description?: string;
  aspectRatio: AspectRatioType;
  dimensions: CanvasDimensions;
  background: BackgroundState;
  textLayers: TextLayer[];
  stickers: StickerLayer[];
  frame: BorderFrame;
  watermark: Watermark;
  createdAt: number;
  updatedAt: number;
  thumbnailUrl?: string;
}

export interface ExportOptions {
  format: 'image/png' | 'image/jpeg' | 'image/webp';
  quality: number; // 0 to 1
  scaleMultiplier: number; // 1, 2, 4
  filename: string;
  includeWatermark: boolean;
}

export interface BatchItem {
  id: string;
  textOverrides: Record<string, string>; // layerId -> new text
  imageUrlOverride?: string;
  filename: string;
  status: 'pending' | 'rendering' | 'done' | 'error';
  dataUrl?: string;
  error?: string;
}

export interface ExifReport {
  hasExif: boolean;
  tagsFound: string[];
  gpsPurged: boolean;
  cameraInfoPurged: boolean;
  timestampPurged: boolean;
  sanitizedSizeBytes: number;
}
