import React from 'react';
import { Copy, Trash2, Lock, Unlock, AlignCenter } from 'lucide-react';
import { StudioTemplate, TextLayer, StickerLayer } from '../../types/studio';

interface Props {
  template: StudioTemplate;
  selectedLayerId: string | null;
  selectedLayerType: 'text' | 'sticker' | null;
  canvasRect: DOMRect | null;
  onUpdateText: (id: string, partial: Partial<TextLayer>) => void;
  onDeleteText: (id: string) => void;
  onDuplicateText: (id: string) => void;
  onDeleteSticker: (id: string) => void;
  onUpdateSticker: (id: string, partial: Partial<StickerLayer>) => void;
}

export const LayerTransformer: React.FC<Props> = ({
  template,
  selectedLayerId,
  canvasRect,
  onUpdateText,
  onDeleteText,
  onDuplicateText,
  onDeleteSticker,
}) => {
  if (!selectedLayerId || !canvasRect) return null;

  const targetTextLayer = template.textLayers.find((l) => l.id === selectedLayerId);
  const targetSticker = template.stickers.find((s) => s.id === selectedLayerId);

  if (!targetTextLayer && !targetSticker) return null;

  const scaleX = canvasRect.width / template.dimensions.width;
  const scaleY = canvasRect.height / template.dimensions.height;

  if (targetTextLayer) {
    const screenX = targetTextLayer.x * scaleX;
    const screenY = targetTextLayer.y * scaleY;
    const approxW = (targetTextLayer.maxWidth || template.dimensions.width * 0.9) * scaleX;
    const approxH = targetTextLayer.fontSize * targetTextLayer.lineHeight * 1.4 * scaleY;

    // Fixed bounding box centered at screenX
    const left = screenX - approxW / 2;

    let top = screenY;
    if (targetTextLayer.verticalAlign === 'middle') {
      top = screenY - approxH / 2;
    } else if (targetTextLayer.verticalAlign === 'bottom') {
      top = screenY - approxH;
    }

    return (
      <div
        className="absolute pointer-events-none z-30 transition-all duration-75"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${Math.max(approxW, 60)}px`,
          height: `${Math.max(approxH, 30)}px`,
          transform: `rotate(${targetTextLayer.rotation}deg)`,
          transformOrigin: '50% 50%',
        }}
      >
        {/* Bounding Box Border */}
        <div className="w-full h-full border-2 border-emerald-600 border-dashed rounded bg-emerald-500/5 relative shadow-xs pointer-events-none">
          {/* Corner Handles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-xs" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-xs" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-xs" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-xs" />

          {/* Top Quick Actions Floating Toolbar */}
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-md pointer-events-auto">
            <span className="text-[10px] font-semibold text-slate-700 px-1 truncate max-w-[90px]">
              {targetTextLayer.name}
            </span>

            <button
              onClick={() => onUpdateText(targetTextLayer.id, { x: template.dimensions.width / 2 })}
              className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
              title="Center Horizontally"
            >
              <AlignCenter className="w-3 h-3" />
            </button>

            <button
              onClick={() => onDuplicateText(targetTextLayer.id)}
              className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="w-3 h-3" />
            </button>

            <button
              onClick={() => onUpdateText(targetTextLayer.id, { locked: !targetTextLayer.locked })}
              className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors"
              title={targetTextLayer.locked ? 'Unlock' : 'Lock'}
            >
              {targetTextLayer.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3" />}
            </button>

            <button
              onClick={() => onDeleteText(targetTextLayer.id)}
              className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
              title="Delete (Del)"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (targetSticker) {
    const screenX = targetSticker.x * scaleX;
    const screenY = targetSticker.y * scaleY;
    const size = targetSticker.size * scaleX;

    return (
      <div
        className="absolute pointer-events-none z-30"
        style={{
          left: `${screenX - size / 2}px`,
          top: `${screenY - size / 2}px`,
          width: `${size}px`,
          height: `${size}px`,
          transform: `rotate(${targetSticker.rotation}deg)`,
        }}
      >
        <div className="w-full h-full border-2 border-emerald-600 border-dashed rounded-full bg-emerald-500/10 relative">
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-md pointer-events-auto">
            <button
              onClick={() => onDeleteSticker(targetSticker.id)}
              className="p-1 hover:bg-red-50 text-red-600 rounded"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
