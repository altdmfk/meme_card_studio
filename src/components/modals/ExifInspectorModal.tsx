import React from 'react';
import { X, ShieldCheck, MapPin, Camera, Calendar, FileText, Check } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExifInspectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { lastExifReport } = useStudio();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800">
              EXIF & Privacy Metadata Sanitizer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-600">
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-1.5">
            <div className="font-bold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              100% Client-Side Metadata Stripped
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              When you upload photos, binary EXIF headers, GPS coordinates, camera serial numbers, and thumbnail caches are decoded and purged in-memory before reaching the canvas.
            </p>
          </div>

          {/* Audit List */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-800">Purged Metadata Categories:</span>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  GPS Geolocation (Lat / Long)
                </span>
                <span className="text-emerald-700 font-bold">PURGED ✓</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <Camera className="w-3.5 h-3.5 text-blue-500" />
                  Device & Lens Serial Numbers
                </span>
                <span className="text-emerald-700 font-bold">PURGED ✓</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  Original Creation DateTime
                </span>
                <span className="text-emerald-700 font-bold">PURGED ✓</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  Embedded EXIF Thumbnail Caches
                </span>
                <span className="text-emerald-700 font-bold">PURGED ✓</span>
              </div>
            </div>
          </div>

          {lastExifReport && lastExifReport.tagsFound.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-600 font-semibold">
                Detected tags sanitized from current image:
              </span>
              <div className="flex flex-wrap gap-1 pt-1">
                {lastExifReport.tagsFound.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-mono shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
