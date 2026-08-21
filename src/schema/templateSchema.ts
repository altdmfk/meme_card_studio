import { z } from 'zod';
import { StudioTemplate } from '../types/studio';

export const ImageFiltersSchema = z.object({
  brightness: z.number().min(0).max(200).default(100),
  contrast: z.number().min(0).max(200).default(100),
  saturation: z.number().min(0).max(200).default(100),
  blur: z.number().min(0).max(50).default(0),
  grayscale: z.number().min(0).max(100).default(0),
  sepia: z.number().min(0).max(100).default(0),
  invert: z.number().min(0).max(100).default(0),
  hueRotate: z.number().min(0).max(360).default(0),
  vignette: z.number().min(0).max(100).default(0),
}).default({
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hueRotate: 0,
  vignette: 0,
});

export const BackgroundStateSchema = z.object({
  type: z.enum(['color', 'gradient', 'image', 'transparent']).default('color'),
  color: z.string().default('#0f172a'),
  gradient: z.object({
    type: z.enum(['linear', 'radial']).default('linear'),
    colors: z.tuple([z.string(), z.string()]).default(['#3b82f6', '#8b5cf6']),
    angle: z.number().default(135),
  }).default({
    type: 'linear',
    colors: ['#3b82f6', '#8b5cf6'],
    angle: 135,
  }),
  image: z.object({
    url: z.string().nullable().default(null),
    originalName: z.string().optional(),
    fit: z.enum(['cover', 'contain', 'fill', 'stretch']).default('cover'),
    offsetX: z.number().default(0),
    offsetY: z.number().default(0),
    zoom: z.number().min(0.01).max(10).default(1),
    rotation: z.number().default(0),
    flipH: z.boolean().default(false),
    flipV: z.boolean().default(false),
    filters: ImageFiltersSchema,
    exifStripped: z.boolean().optional(),
    rawExifFound: z.array(z.string()).optional(),
  }).default({
    url: null,
    fit: 'cover',
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    rotation: 0,
    flipH: false,
    flipV: false,
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      hueRotate: 0,
      vignette: 0,
    },
  }),
});

export const TextBackgroundBoxSchema = z.object({
  enabled: z.boolean().default(false),
  color: z.string().default('rgba(0, 0, 0, 0.7)'),
  paddingX: z.number().default(16),
  paddingY: z.number().default(8),
  borderRadius: z.number().default(8),
  borderWidth: z.number().default(0),
  borderColor: z.string().default('#ffffff'),
}).default({
  enabled: false,
  color: 'rgba(0, 0, 0, 0.7)',
  paddingX: 16,
  paddingY: 8,
  borderRadius: 8,
  borderWidth: 0,
  borderColor: '#ffffff',
});

export const TextShadowSchema = z.object({
  enabled: z.boolean().default(false),
  color: z.string().default('rgba(0, 0, 0, 0.8)'),
  blur: z.number().default(6),
  offsetX: z.number().default(2),
  offsetY: z.number().default(4),
}).default({
  enabled: false,
  color: 'rgba(0, 0, 0, 0.8)',
  blur: 6,
  offsetX: 2,
  offsetY: 4,
});

export const TextLayerSchema = z.object({
  id: z.string(),
  name: z.string().default('Text Layer'),
  text: z.string().default(''),
  x: z.number().default(540),
  y: z.number().default(540),
  rotation: z.number().default(0),
  fontFamily: z.string().default('Inter'),
  fontSize: z.number().min(1).max(500).default(48),
  fontWeight: z.enum(['300', '400', '500', '600', '700', '800', '900', 'bold', 'normal']).default('700'),
  fontStyle: z.enum(['normal', 'italic']).default('normal'),
  color: z.string().default('#ffffff'),
  opacity: z.number().min(0).max(1).default(1),
  align: z.enum(['left', 'center', 'right']).default('center'),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).default('middle'),
  lineHeight: z.number().min(0.1).max(10).default(1.2),
  letterSpacing: z.number().min(-50).max(100).default(0),
  transform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).default('none'),
  strokeWidth: z.number().min(0).max(100).default(0),
  strokeColor: z.string().default('#000000'),
  shadow: TextShadowSchema,
  backgroundBox: TextBackgroundBoxSchema,
  maxWidth: z.number().optional(),
  maxHeight: z.number().optional(),
  autoScale: z.boolean().default(false),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  zIndex: z.number().default(1),
});

export const StickerLayerSchema = z.object({
  id: z.string(),
  type: z.enum(['emoji', 'badge', 'shape']).default('emoji'),
  content: z.string(),
  x: z.number().default(100),
  y: z.number().default(100),
  size: z.number().min(1).max(1000).default(80),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  zIndex: z.number().default(1),
});

export const BorderFrameSchema = z.object({
  enabled: z.boolean().default(false),
  color: z.string().default('#ffffff'),
  width: z.number().min(0).max(100).default(0),
  inset: z.number().min(0).max(200).default(0),
  radius: z.number().min(0).max(200).default(0),
  style: z.enum(['solid', 'dashed', 'double']).default('solid'),
}).default({
  enabled: false,
  color: '#ffffff',
  width: 0,
  inset: 0,
  radius: 0,
  style: 'solid',
});

export const WatermarkSchema = z.object({
  enabled: z.boolean().default(false),
  text: z.string().default('@MemeStudio'),
  fontSize: z.number().min(0).max(200).default(20),
  fontFamily: z.string().default('Inter'),
  color: z.string().default('rgba(255, 255, 255, 0.4)'),
  opacity: z.number().min(0).max(1).default(0.5),
  position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center', 'pattern']).default('bottom-right'),
}).default({
  enabled: false,
  text: '@MemeStudio',
  fontSize: 20,
  fontFamily: 'Inter',
  color: 'rgba(255, 255, 255, 0.4)',
  opacity: 0.5,
  position: 'bottom-right',
});

export const StudioTemplateSchema = z.object({
  id: z.string(),
  version: z.string().default('1.0'),
  name: z.string().min(1, 'Template name is required'),
  category: z.enum(['meme', 'social', 'minimal', 'news', 'quote', 'custom']).default('custom'),
  description: z.string().optional(),
  aspectRatio: z.enum(['1:1', '4:5', '9:16', '16:9', '4:3', '3:4', '2:1', 'custom']).default('1:1'),
  dimensions: z.object({
    width: z.number().min(50).max(10000).default(1080),
    height: z.number().min(50).max(10000).default(1080),
  }).default({ width: 1080, height: 1080 }),
  background: BackgroundStateSchema,
  textLayers: z.array(TextLayerSchema).default([]),
  stickers: z.array(StickerLayerSchema).default([]),
  frame: BorderFrameSchema,
  watermark: WatermarkSchema,
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
  thumbnailUrl: z.string().optional(),
});

export const TemplateBundleSchema = z.object({
  schemaVersion: z.literal('1.0'),
  exportedAt: z.string(),
  app: z.literal('MemeAndCardStudio'),
  templates: z.array(StudioTemplateSchema),
});

export type TemplateBundle = z.infer<typeof TemplateBundleSchema>;

export interface ValidationResult {
  success: boolean;
  template?: StudioTemplate;
  bundle?: StudioTemplate[];
  errors: string[];
}

export function validateAndParseTemplateJSON(jsonString: string): ValidationResult {
  try {
    const raw = JSON.parse(jsonString);

    // Case 1: Template Bundle
    if (raw && typeof raw === 'object' && 'templates' in raw && Array.isArray(raw.templates)) {
      const parsedBundle = TemplateBundleSchema.safeParse(raw);
      if (parsedBundle.success) {
        return {
          success: true,
          bundle: parsedBundle.data.templates as StudioTemplate[],
          errors: [],
        };
      }
      return {
        success: false,
        errors: parsedBundle.error.issues.map(
          (issue) => `[${issue.path.join('.')}] ${issue.message}`
        ),
      };
    }

    // Case 2: Single Template
    const parsedSingle = StudioTemplateSchema.safeParse(raw);
    if (parsedSingle.success) {
      return {
        success: true,
        template: parsedSingle.data as StudioTemplate,
        errors: [],
      };
    }

    return {
      success: false,
      errors: parsedSingle.error.issues.map(
        (issue) => `[${issue.path.join('.')}] ${issue.message}`
      ),
    };
  } catch (err: unknown) {
    return {
      success: false,
      errors: [`JSON Syntax Error: ${err instanceof Error ? err.message : 'Invalid JSON format'}`],
    };
  }
}
