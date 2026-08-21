import React from 'react';
import { StudioTemplate } from '../../types/studio';

interface Props {
  template: StudioTemplate;
  showGuides: boolean;
}

export const CanvasOverlayGuides: React.FC<Props> = ({ template, showGuides }) => {
  if (!showGuides) return null;

  const isStory = template.aspectRatio === '9:16';

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-lg select-none">
      {/* Full Canvas High-Visibility Square Grid */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Minor 25px grid lines (1.5px thick, clear contrast) */}
          <pattern id="smallGrid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path
              d="M 25 0 L 0 0 0 25"
              fill="none"
              stroke="rgba(71, 85, 105, 0.32)"
              strokeWidth="1.5"
            />
          </pattern>
          {/* Major 100px grid lines (2.5px thick, high-visibility) */}
          <pattern id="majorGrid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)" />
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="rgba(30, 41, 59, 0.55)"
              strokeWidth="2.5"
            />
          </pattern>
        </defs>

        {/* Fill entire canvas with high-contrast full grid */}
        <rect width="100%" height="100%" fill="url(#majorGrid)" />
      </svg>

      {/* Center Horizontal & Vertical Alignment Guides (Thick Emerald Crosshairs) */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[2.5px] bg-emerald-600/70 shadow-xs transform -translate-x-1/2" />
      <div className="absolute top-1/2 left-0 right-0 h-[2.5px] bg-emerald-600/70 shadow-xs transform -translate-y-1/2" />

      {/* Instagram Story Safe Zones (Top Header + Bottom CTA UI) */}
      {isStory && (
        <>
          <div className="absolute top-0 left-0 right-0 h-[14%] bg-slate-900/10 border-b-2 border-dashed border-slate-600/80 flex items-end justify-center pb-1.5">
            <span className="text-[11px] font-mono font-bold text-slate-800 bg-white/95 border border-slate-400 px-2.5 py-0.5 rounded shadow-xs">
              Story Top Safe Zone (250px)
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-slate-900/10 border-t-2 border-dashed border-slate-600/80 flex items-start justify-center pt-1.5">
            <span className="text-[11px] font-mono font-bold text-slate-800 bg-white/95 border border-slate-400 px-2.5 py-0.5 rounded shadow-xs">
              Story Bottom Safe Zone (340px)
            </span>
          </div>
        </>
      )}

      {/* 1:1 Feed Crop Guide on non-1:1 Canvas */}
      {template.aspectRatio === '4:5' && (
        <div className="absolute left-0 right-0 top-[10%] bottom-[10%] border-2 border-slate-600/80 border-dashed flex items-center justify-center">
          <span className="text-[11px] font-mono font-bold text-slate-800 bg-white/95 border border-slate-400 px-2.5 py-0.5 rounded shadow-xs">
            Square 1:1 Feed Preview
          </span>
        </div>
      )}
    </div>
  );
};
