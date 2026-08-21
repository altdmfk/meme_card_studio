import React from 'react';
import {
  Smile,
  Square,
  Trash2,
  Type,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { STICKER_PRESETS } from '../../presets/defaultStickers';
import { ColorPicker } from '../common/ColorPicker';
import { SliderControl } from '../common/SliderControl';
import { Watermark } from '../../types/studio';

export const OverlayDecorationsTab: React.FC = () => {
  const {
    template,
    addSticker,
    updateSticker,
    deleteSticker,
    selectedLayerId,
    updateFrame,
    updateWatermark,
  } = useStudio();

  const selectedSticker = template.stickers.find((s) => s.id === selectedLayerId);
  const frame = template.frame;
  const watermark = template.watermark;

  return (
    <div className="space-y-5">
      {/* 1. Emoji & Sticker Presets */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Smile className="w-3.5 h-3.5 text-emerald-600" />
          Click to Add Stickers
        </label>

        <div className="grid grid-cols-6 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
          {STICKER_PRESETS.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => addSticker(sticker.content, 'emoji')}
              className="w-full aspect-square flex items-center justify-center text-xl hover:bg-white hover:shadow-xs rounded-lg transition-transform hover:scale-125"
              title={sticker.label}
            >
              {sticker.content}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Sticker Controls */}
      {selectedSticker && (
        <div className="space-y-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="text-lg">{selectedSticker.content}</span>
              Edit Sticker
            </span>
            <button
              onClick={() => deleteSticker(selectedSticker.id)}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
              title="Delete Sticker"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <SliderControl
            label="Sticker Size"
            value={selectedSticker.size}
            min={20}
            max={300}
            unit="px"
            onChange={(size) => updateSticker(selectedSticker.id, { size })}
          />

          <SliderControl
            label="Rotation"
            value={selectedSticker.rotation}
            min={-180}
            max={180}
            unit="°"
            defaultValue={0}
            onReset={() => updateSticker(selectedSticker.id, { rotation: 0 })}
            onChange={(rotation) => updateSticker(selectedSticker.id, { rotation })}
          />

          <SliderControl
            label="Opacity"
            value={Math.round(selectedSticker.opacity * 100)}
            min={10}
            max={100}
            unit="%"
            defaultValue={100}
            onChange={(val) => updateSticker(selectedSticker.id, { opacity: val / 100 })}
          />
        </div>
      )}

      {/* 2. Border Frame (Renamed from Decorative Border Frame) */}
      <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Square className="w-3.5 h-3.5 text-emerald-600" />
            Border Frame
          </span>
          <input
            type="checkbox"
            checked={frame.enabled}
            onChange={(e) => updateFrame({ enabled: e.target.checked })}
            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
          />
        </div>

        {frame.enabled && (
          <div className="space-y-3 pt-2">
            <ColorPicker
              label="Border Color"
              value={frame.color}
              onChange={(color) => updateFrame({ color })}
            />

            <div className="grid grid-cols-2 gap-2">
              <SliderControl
                label="Border Width"
                value={frame.width}
                min={1}
                max={50}
                unit="px"
                onChange={(width) => updateFrame({ width })}
              />
              <SliderControl
                label="Border Inset"
                value={frame.inset}
                min={0}
                max={80}
                unit="px"
                onChange={(inset) => updateFrame({ inset })}
              />
            </div>

            <SliderControl
              label="Corner Radius"
              value={frame.radius}
              min={0}
              max={60}
              unit="px"
              onChange={(radius) => updateFrame({ radius })}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-600">Frame Style</span>
              <div className="flex gap-1">
                {(['solid', 'dashed'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateFrame({ style })}
                    className={`px-2.5 py-1 rounded text-xs capitalize ${
                      frame.style === style
                        ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Watermark (Renamed from Watermark / Handle) */}
      <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-emerald-600" />
            Watermark
          </span>
          <input
            type="checkbox"
            checked={watermark.enabled}
            onChange={(e) => updateWatermark({ enabled: e.target.checked })}
            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
          />
        </div>

        {watermark.enabled && (
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Watermark Text</label>
              <input
                type="text"
                value={watermark.text}
                onChange={(e) => updateWatermark({ text: e.target.value })}
                placeholder="@YourHandle"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <ColorPicker
              label="Watermark Color"
              value={watermark.color}
              onChange={(color) => updateWatermark({ color })}
            />

            <div className="grid grid-cols-2 gap-2">
              <SliderControl
                label="Size"
                value={watermark.fontSize}
                min={12}
                max={50}
                unit="px"
                onChange={(fontSize) => updateWatermark({ fontSize })}
              />
              <SliderControl
                label="Opacity"
                value={Math.round(watermark.opacity * 100)}
                min={10}
                max={100}
                unit="%"
                onChange={(val) => updateWatermark({ opacity: val / 100 })}
              />
            </div>

            {/* Position Picker */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Position</label>
              <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[10px]">
                {(
                  [
                    'top-left',
                    'center',
                    'top-right',
                    'bottom-left',
                    'bottom-right',
                  ] as Watermark['position'][]
                ).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateWatermark({ position: pos })}
                    className={`py-1 rounded text-center capitalize ${
                      watermark.position === pos
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
