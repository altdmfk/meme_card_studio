import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { exportStudioToBlob, downloadBlob, copyCanvasToClipboard, renderTemplateToCanvas } from '../../core/canvas/exportEngine';
import { ExportOptions } from '../../types/studio';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { template } = useStudio();
  const [format, setFormat] = useState<ExportOptions['format']>('image/png');
  const [quality, setQuality] = useState<number>(0.92);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(2);
  const [filename, setFilename] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cleanName = template.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      setFilename(`${cleanName || 'card'}_${template.aspectRatio.replace(':', 'x')}`);
      setIsCopied(false);

      // Generate preview thumbnail
      renderTemplateToCanvas(template, 0.4)
        .then((canvas) => setPreviewDataUrl(canvas.toDataURL('image/png')))
        .catch((e) => console.warn('Could not render export preview', e));
    }
  }, [isOpen, template]);

  if (!isOpen) return null;

  const targetWidth = Math.round(template.dimensions.width * scaleMultiplier);
  const targetHeight = Math.round(template.dimensions.height * scaleMultiplier);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format,
        quality,
        scaleMultiplier,
        filename,
        includeWatermark: template.watermark.enabled,
      };

      const blob = await exportStudioToBlob(template, options);
      const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
      downloadBlob(blob, `${filename.trim() || 'card'}.${ext}`);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });

      onClose();
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Check console.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    setIsExporting(true);
    try {
      await copyCanvasToClipboard(template, scaleMultiplier);
      setIsCopied(true);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
      alert('Could not copy image to clipboard in this browser.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <Download className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800">
              Export Graphic (High-DPI)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Live Mini Preview & Resolution Pill */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="w-24 h-24 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Export preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400 animate-pulse" />
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800">{template.name}</div>
              <div className="text-xs font-mono text-emerald-600 font-semibold">
                Output: {targetWidth} × {targetHeight} px
              </div>
              <div className="text-[11px] text-slate-500">
                Aspect: {template.aspectRatio} • Scale: {scaleMultiplier}x
              </div>
            </div>
          </div>

          {/* Format Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">File Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'image/png', label: 'PNG', desc: 'Lossless & Transparency' },
                { id: 'image/jpeg', label: 'JPEG', desc: 'Compact Web Size' },
                { id: 'image/webp', label: 'WEBP', desc: 'Modern High Compression' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id as ExportOptions['format'])}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    format === fmt.id
                      ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-200 text-emerald-900 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-2xs'
                  }`}
                >
                  <div className="text-xs font-bold">{fmt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{fmt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPEG / WEBP) */}
          {format !== 'image/png' && (
            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs text-slate-700 font-medium">
                <span>Compression Quality</span>
                <span className="font-mono">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.01"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          )}

          {/* Resolution Multiplier */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">
              Resolution Scale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { scale: 1, label: '1x Standard', desc: `${template.dimensions.width}px` },
                { scale: 2, label: '2x High-DPI', desc: `${template.dimensions.width * 2}px` },
                { scale: 4, label: '4x Ultra-HD', desc: `${template.dimensions.width * 4}px` },
              ].map((s) => (
                <button
                  key={s.scale}
                  onClick={() => setScaleMultiplier(s.scale)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    scaleMultiplier === s.scale
                      ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-200 text-emerald-900 font-semibold shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-2xs'
                  }`}
                >
                  <div className="text-xs font-bold">{s.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filename input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">File Name</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyClipboard}
            disabled={isExporting}
            className="flex items-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-emerald-600" />
                <span>Copy Image</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating Image...' : 'Download Image File'}
          </button>
        </div>
      </div>
    </div>
  );
};
