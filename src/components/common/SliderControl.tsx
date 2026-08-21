import React from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  onReset?: () => void;
  defaultValue?: number;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  onReset,
  defaultValue,
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-700 font-medium">{label}</span>
        <div className="flex items-center gap-1.5 font-mono text-slate-500">
          <span>
            {value}
            {unit}
          </span>
          {onReset && defaultValue !== undefined && value !== defaultValue && (
            <button
              onClick={onReset}
              className="text-[10px] text-emerald-600 hover:text-emerald-700 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:bg-slate-300 transition-colors"
        />
      </div>
    </div>
  );
};
