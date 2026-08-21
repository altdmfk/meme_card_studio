import React from 'react';
import {
  Undo2,
  Redo2,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Grid,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

interface Props {
  onOpenExportModal: () => void;
  onOpenJsonModal: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenExportModal, onOpenJsonModal }) => {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    resetCanvas,
    zoom,
    setZoom,
    isFitToScreen,
    setIsFitToScreen,
    showGuides,
    setShowGuides,
  } = useStudio();

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 select-none shadow-xs">
      {/* Left: Brand Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-base font-bold text-slate-800 tracking-tight">
          Meme & Card Studio
        </h1>
      </div>

      {/* Center: History & Viewport Controls */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-lg">
        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-md hover:bg-slate-200 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-md hover:bg-slate-200 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {/* Zoom Controls */}
        <button
          onClick={() => {
            setIsFitToScreen(false);
            setZoom(Math.max(zoom - 0.1, 0.2));
          }}
          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsFitToScreen(!isFitToScreen)}
          className={`px-2 py-1 text-xs font-mono rounded-md transition-colors ${
            isFitToScreen
              ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title="Toggle Fit to Screen"
        >
          {isFitToScreen ? 'Fit' : `${Math.round(zoom * 100)}%`}
        </button>

        <button
          onClick={() => {
            setIsFitToScreen(false);
            setZoom(Math.min(zoom + 0.1, 3.0));
          }}
          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {/* Guides Toggle */}
        <button
          onClick={() => setShowGuides(!showGuides)}
          className={`p-1.5 rounded-md transition-colors ${
            showGuides
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title="Toggle Grid Guides"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Reset Canvas */}
        <button
          onClick={() => {
            if (confirm('Reset canvas to default template?')) {
              resetCanvas();
            }
          }}
          className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
          title="Reset Canvas"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Export & JSON CTAs */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenJsonModal}
          className="flex items-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
        >
          <FileCode className="w-3.5 h-3.5 text-emerald-600" />
          JSON Config
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-2 py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Download className="w-4 h-4" />
          Export Image
        </button>
      </div>
    </header>
  );
};
