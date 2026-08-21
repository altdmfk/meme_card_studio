import { TextLayer } from '../../types/studio';

export interface MeasuredTextLine {
  text: string;
  width: number;
}

export interface TextLayoutResult {
  lines: MeasuredTextLine[];
  totalWidth: number;
  totalHeight: number;
  lineHeightPx: number;
  computedFontSize: number;
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
}

/**
 * Tokenizes text into words, whitespace, and CJK / Emoji graphemes for proper line wrapping.
 */
export function tokenizeMultilingualText(text: string): string[] {
  const cjkAndEmojiRegex = /([\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\u4e00-\u9fff\u3040-\u30ff\p{Extended_Pictographic}])/u;
  
  const tokens: string[] = [];
  const words = text.split(/(\s+)/);

  for (const word of words) {
    if (word === '') continue;
    if (/^\s+$/.test(word)) {
      tokens.push(word);
      continue;
    }

    const parts = word.split(cjkAndEmojiRegex).filter(Boolean);
    tokens.push(...parts);
  }

  return tokens;
}

/**
 * Strict greedy line-wrapping: Wraps words when reaching maxWidth.
 * If a single word/token exceeds maxWidth, breaks at character level so text NEVER overflows the area.
 */
export function wrapParagraph(
  ctx: CanvasRenderingContext2D,
  paragraph: string,
  maxWidth: number
): MeasuredTextLine[] {
  if (!paragraph) {
    return [{ text: '', width: 0 }];
  }

  const tokens = tokenizeMultilingualText(paragraph);
  const lines: MeasuredTextLine[] = [];
  let currentLine = '';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const testLine = currentLine ? currentLine + token : token;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      // If current line has content, push it and start new line with token
      if (currentLine.trim()) {
        lines.push({ text: currentLine, width: ctx.measureText(currentLine).width });
        currentLine = '';
      }

      // Check if token alone fits on a new line
      const cleanToken = token.startsWith(' ') ? token.trimStart() : token;
      const tokenWidth = ctx.measureText(cleanToken).width;

      if (tokenWidth <= maxWidth) {
        currentLine = cleanToken;
      } else {
        // Token is longer than maxWidth: break character by character
        const chars = Array.from(cleanToken);
        for (const char of chars) {
          const charTest = currentLine + char;
          const charWidth = ctx.measureText(charTest).width;
          if (charWidth <= maxWidth) {
            currentLine = charTest;
          } else {
            if (currentLine) {
              lines.push({ text: currentLine, width: ctx.measureText(currentLine).width });
            }
            currentLine = char;
          }
        }
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push({ text: currentLine, width: ctx.measureText(currentLine).width });
  }

  return lines.length > 0 ? lines : [{ text: '', width: 0 }];
}

/**
 * Computes text layout and wrapping.
 * Automatically reduces font size if total text overflows the canvas height.
 */
export function computeTextLayout(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasWidth: number,
  canvasHeight: number
): TextLayoutResult {
  // Apply text transformation
  let transformedText = layer.text;
  if (layer.transform === 'uppercase') {
    transformedText = transformedText.toUpperCase();
  } else if (layer.transform === 'lowercase') {
    transformedText = transformedText.toLowerCase();
  } else if (layer.transform === 'capitalize') {
    transformedText = transformedText.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const maxWidth = layer.maxWidth ?? Math.round(canvasWidth * 0.85);
  const maxAllowedHeight = layer.maxHeight ?? Math.round(canvasHeight * 0.88);
  const minAllowedFontSize = 14;

  let fontSize = layer.fontSize;
  let lineHeightPx = fontSize * layer.lineHeight;
  const paragraphs = transformedText.split('\n');
  let lines: MeasuredTextLine[] = [];
  let totalHeight = 0;
  let maxLineWidth = 0;

  // Auto-downscale loop if text overflows canvas vertically
  while (fontSize >= minAllowedFontSize) {
    lineHeightPx = fontSize * layer.lineHeight;
    ctx.font = `${layer.fontStyle} ${layer.fontWeight} ${fontSize}px ${layer.fontFamily}, sans-serif`;
    if ('letterSpacing' in ctx) {
      (ctx as any).letterSpacing = `${layer.letterSpacing}px`;
    }

    lines = [];
    for (const para of paragraphs) {
      const wrapped = wrapParagraph(ctx, para, maxWidth);
      lines.push(...wrapped);
    }

    maxLineWidth = lines.reduce((max, l) => Math.max(max, l.width), 0);
    totalHeight = lines.length * lineHeightPx;

    // Stop if fits within canvas bounds or at minimum font size
    if (totalHeight <= maxAllowedHeight || fontSize <= minAllowedFontSize) {
      break;
    }

    // Step down font size smoothly
    const nextSize = Math.floor(fontSize * 0.88);
    if (nextSize >= fontSize) break;
    fontSize = Math.max(minAllowedFontSize, nextSize);
  }

  const paddingX = layer.backgroundBox.enabled ? layer.backgroundBox.paddingX : 0;
  const paddingY = layer.backgroundBox.enabled ? layer.backgroundBox.paddingY : 0;

  // The bounding box is fixed to maxWidth centered at layer.x
  const boxWidth = maxWidth;
  const boxHeight = totalHeight + paddingY * 2;
  const boxX = layer.x - boxWidth / 2;

  let boxY = layer.y;
  if (layer.verticalAlign === 'middle') {
    boxY = layer.y - boxHeight / 2;
  } else if (layer.verticalAlign === 'bottom') {
    boxY = layer.y - boxHeight;
  }

  return {
    lines,
    totalWidth: maxLineWidth,
    totalHeight,
    lineHeightPx,
    computedFontSize: fontSize,
    boxX,
    boxY,
    boxWidth,
    boxHeight,
  };
}

/**
 * Draws rounded rectangle utility on canvas context.
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Renders a single TextLayer onto the canvas context with full styling.
 */
export function renderTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!layer.visible || !layer.text || !layer.text.trim()) return;

  ctx.save();
  ctx.globalAlpha = layer.opacity;

  // Handle Layer Rotation
  if (layer.rotation !== 0) {
    ctx.translate(layer.x, layer.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.translate(-layer.x, -layer.y);
  }

  const layout = computeTextLayout(ctx, layer, canvasWidth, canvasHeight);

  // 1. Draw Background Box if enabled
  if (layer.backgroundBox.enabled && layout.boxWidth > 0 && layout.boxHeight > 0) {
    ctx.save();
    ctx.fillStyle = layer.backgroundBox.color;
    
    const paddingX = layer.backgroundBox.paddingX;
    let bgBoxX = layout.boxX;
    let bgBoxW = layout.totalWidth + paddingX * 2;

    if (layer.align === 'left') {
      bgBoxX = layout.boxX;
    } else if (layer.align === 'center') {
      bgBoxX = layer.x - (layout.totalWidth + paddingX * 2) / 2;
    } else if (layer.align === 'right') {
      bgBoxX = layout.boxX + layout.boxWidth - (layout.totalWidth + paddingX * 2);
    }

    drawRoundedRect(
      ctx,
      bgBoxX,
      layout.boxY,
      bgBoxW,
      layout.boxHeight,
      layer.backgroundBox.borderRadius
    );
    ctx.fill();

    if (layer.backgroundBox.borderWidth > 0) {
      ctx.lineWidth = layer.backgroundBox.borderWidth;
      ctx.strokeStyle = layer.backgroundBox.borderColor;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2. Set Typography
  ctx.font = `${layer.fontStyle} ${layer.fontWeight} ${layout.computedFontSize}px ${layer.fontFamily}, sans-serif`;
  ctx.textAlign = layer.align;
  ctx.textBaseline = 'top';

  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = `${layer.letterSpacing}px`;
  }

  // 3. Shadow configuration
  if (layer.shadow.enabled) {
    ctx.shadowColor = layer.shadow.color;
    ctx.shadowBlur = layer.shadow.blur;
    ctx.shadowOffsetX = layer.shadow.offsetX;
    ctx.shadowOffsetY = layer.shadow.offsetY;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // Calculate starting Y position and anchor X
  const paddingY = layer.backgroundBox.enabled ? layer.backgroundBox.paddingY : 0;
  const paddingX = layer.backgroundBox.enabled ? layer.backgroundBox.paddingX : 0;
  const startY = layout.boxY + paddingY;

  let textAnchorX = layer.x;
  if (layer.align === 'left') {
    textAnchorX = layout.boxX + paddingX;
  } else if (layer.align === 'right') {
    textAnchorX = layout.boxX + layout.boxWidth - paddingX;
  } else {
    textAnchorX = layer.x;
  }

  // 4. Render lines
  linesLoop: for (let i = 0; i < layout.lines.length; i++) {
    const line = layout.lines[i];
    const currentY = startY + i * layout.lineHeightPx;

    if (!line.text) continue;

    // Stroke Outline
    if (layer.strokeWidth > 0) {
      ctx.save();
      ctx.lineWidth = layer.strokeWidth * 2;
      ctx.strokeStyle = layer.strokeColor;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(line.text, textAnchorX, currentY);
      ctx.restore();
    }

    // Main Glyph Fill
    ctx.fillStyle = layer.color;
    ctx.fillText(line.text, textAnchorX, currentY);
  }

  ctx.restore();
}
