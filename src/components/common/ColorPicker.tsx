import React from 'react';

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

const DEFAULT_PRESET_COLORS = [
  '#FFFFFF', '#000000', '#64748B', '#10B981', '#059669', 
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', 
  '#EF4444', '#F97316', '#F59E0B', '#EAB308'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESET_COLORS,
}) => {
  return (
    <div className="space-y-1.5 w-full min-w-0">
      {label && <label className="text-xs font-medium text-slate-700 block truncate">{label}</label>}
      <div className="flex items-center gap-1.5 w-full min-w-0">
        {/* Native color picker with swatch preview */}
        <div className="relative flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden border border-slate-300 bg-white shadow-2xs flex-shrink-0 cursor-pointer">
          <input
            type="color"
            value={value.startsWith('#') && value.length === 7 ? value : '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 w-12 h-12 opacity-0 cursor-pointer"
          />
          <div
            className="w-full h-full rounded"
            style={{ backgroundColor: value }}
          />
        </div>

        {/* Text color input with overflow prevention */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs transition-colors truncate"
          placeholder="#ffffff"
        />
      </div>

      {/* Swatch Presets */}
      <div className="flex flex-wrap gap-1 pt-0.5">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`w-4 h-4 rounded-sm border transition-transform hover:scale-125 ${
              value.toLowerCase() === preset.toLowerCase()
                ? 'border-emerald-600 ring-2 ring-emerald-300 scale-110'
                : 'border-slate-300 shadow-2xs'
            }`}
            style={{ backgroundColor: preset }}
            title={preset}
          />
        ))}
      </div>
    </div>
  );
};
