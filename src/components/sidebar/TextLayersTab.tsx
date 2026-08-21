import React from 'react';
import {
  Type,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Layers,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { AVAILABLE_FONTS } from '../../presets/defaultStickers';
import { ColorPicker } from '../common/ColorPicker';
import { SliderControl } from '../common/SliderControl';

const FONT_WEIGHT_OPTIONS = [
  { value: '300', label: '300 Light' },
  { value: '400', label: '400 Regular' },
  { value: '500', label: '500 Medium' },
  { value: '600', label: '600 SemiBold' },
  { value: '700', label: '700 Bold' },
  { value: '800', label: '800 ExtraBold' },
  { value: '900', label: '900 Black' },
];

export const TextLayersTab: React.FC = () => {
  const {
    template,
    selectedLayerId,
    setSelectedLayerId,
    addTextLayer,
    updateTextLayer,
    deleteTextLayer,
    duplicateTextLayer,
    reorderTextLayer,
  } = useStudio();

  const selectedLayer = template.textLayers.find((l) => l.id === selectedLayerId);

  return (
    <div className="space-y-5">
      {/* 1. Add Text Layer Button */}
      <button
        onClick={() => addTextLayer()}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-[1.01]"
      >
        <Plus className="w-4 h-4" />
        Add New Text Layer
      </button>

      {/* 2. Text Layers List */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Text Layers ({template.textLayers.length})
          </span>
        </label>

        {template.textLayers.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
            No text layers on canvas. Click the button above to add one.
          </div>
        ) : (
          <div className="space-y-1.5">
            {[...template.textLayers]
              .reverse()
              .map((layer, index, arr) => {
                const isSelected = selectedLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    className={`rounded-xl border p-2.5 flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-200 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                    onClick={() => setSelectedLayerId(layer.id, 'text')}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 border border-slate-300"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-xs font-medium text-slate-800 truncate">
                        {layer.text.trim() || `(${layer.name})`}
                      </span>
                    </div>

                    {/* Layer Actions */}
                    <div
                      className="flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => reorderTextLayer(layer.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reorderTextLayer(layer.id, 'down')}
                        disabled={index === arr.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          updateTextLayer(layer.id, { visible: !layer.visible })
                        }
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                        title={layer.visible ? 'Hide' : 'Show'}
                      >
                        {layer.visible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </button>
                      <button
                        onClick={() => duplicateTextLayer(layer.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTextLayer(layer.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* 3. Selected Layer Inspector Panel */}
      {selectedLayer && (
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-600" />
              Edit Selected Layer
            </span>
          </div>

          {/* Multiline Textarea Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Text Content</label>
            <textarea
              rows={3}
              value={selectedLayer.text}
              onChange={(e) =>
                updateTextLayer(selectedLayer.id, { text: e.target.value })
              }
              placeholder="Type text here."
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs resize-y"
            />
          </div>

          {/* Font Family Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Font Family</label>
            <select
              value={selectedLayer.fontFamily}
              onChange={(e) =>
                updateTextLayer(selectedLayer.id, { fontFamily: e.target.value })
              }
              className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs"
            >
              {AVAILABLE_FONTS.map((font) => (
                <option key={font.name} value={font.family.replace(/"/g, '')}>
                  {font.name} {font.isKorean ? '🇰🇷 [Korean]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size & Weight */}
          <div className="space-y-3">
            <SliderControl
              label="Font Size"
              value={selectedLayer.fontSize}
              min={12}
              max={200}
              unit="px"
              onChange={(fontSize) => updateTextLayer(selectedLayer.id, { fontSize })}
            />

            {/* Font Weight Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">Font Weight</label>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                  {FONT_WEIGHT_OPTIONS.find((o) => o.value === selectedLayer.fontWeight)?.label || selectedLayer.fontWeight}
                </span>
              </div>

              {/* Quick weight buttons */}
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                {[
                  { value: '400', label: 'Regular' },
                  { value: '600', label: 'SemiBold' },
                  { value: '700', label: 'Bold' },
                  { value: '900', label: 'Black' },
                ].map((w) => (
                  <button
                    key={w.value}
                    onClick={() =>
                      updateTextLayer(selectedLayer.id, { fontWeight: w.value as any })
                    }
                    className={`py-1.5 rounded-lg text-center transition-all ${
                      selectedLayer.fontWeight === w.value
                        ? 'bg-white text-emerald-700 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              {/* Comprehensive Weight Dropdown */}
              <select
                value={selectedLayer.fontWeight}
                onChange={(e) =>
                  updateTextLayer(selectedLayer.id, { fontWeight: e.target.value as any })
                }
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 shadow-2xs mt-1"
              >
                {FONT_WEIGHT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Opacity */}
          <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <ColorPicker
              label="Text Color"
              value={selectedLayer.color}
              onChange={(color) => updateTextLayer(selectedLayer.id, { color })}
            />

            <SliderControl
              label="Text Opacity"
              value={Math.round(selectedLayer.opacity * 100)}
              min={10}
              max={100}
              unit="%"
              defaultValue={100}
              onChange={(val) =>
                updateTextLayer(selectedLayer.id, { opacity: val / 100 })
              }
            />
          </div>

          {/* Alignment & Transforms */}
          <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {/* Alignment: Text moves inside the fixed bounding area */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Alignment</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  onClick={() => updateTextLayer(selectedLayer.id, { align: 'left' })}
                  className={`p-1.5 rounded transition-colors ${
                    selectedLayer.align === 'left'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Align Left (Within Area)"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateTextLayer(selectedLayer.id, { align: 'center' })}
                  className={`p-1.5 rounded transition-colors ${
                    selectedLayer.align === 'center'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Align Center (Within Area)"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateTextLayer(selectedLayer.id, { align: 'right' })}
                  className={`p-1.5 rounded transition-colors ${
                    selectedLayer.align === 'right'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Align Right (Within Area)"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Text Transform */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Text Transform</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  onClick={() => updateTextLayer(selectedLayer.id, { transform: 'none' })}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedLayer.transform === 'none'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Normal (As typed)"
                >
                  Aa
                </button>
                <button
                  onClick={() => updateTextLayer(selectedLayer.id, { transform: 'uppercase' })}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedLayer.transform === 'uppercase'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="UPPERCASE"
                >
                  AA
                </button>
                <button
                  onClick={() => updateTextLayer(selectedLayer.id, { transform: 'lowercase' })}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedLayer.transform === 'lowercase'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="lowercase"
                >
                  aa
                </button>
                <button
                  onClick={() => updateTextLayer(selectedLayer.id, { transform: 'capitalize' })}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedLayer.transform === 'capitalize'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Capitalize Each Word"
                >
                  Ab
                </button>
              </div>
            </div>

            {/* Line Height & Letter Spacing */}
            <SliderControl
              label="Line Spacing"
              value={Math.round(selectedLayer.lineHeight * 10) / 10}
              min={0.8}
              max={2.5}
              step={0.1}
              defaultValue={1.2}
              onChange={(lineHeight) =>
                updateTextLayer(selectedLayer.id, { lineHeight })
              }
            />

            <SliderControl
              label="Letter Spacing"
              value={selectedLayer.letterSpacing}
              min={-2}
              max={20}
              step={1}
              unit="px"
              defaultValue={0}
              onChange={(letterSpacing) =>
                updateTextLayer(selectedLayer.id, { letterSpacing })
              }
            />
          </div>

          {/* Stroke Outline */}
          <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-800">Stroke Outline</span>
            <SliderControl
              label="Stroke Thickness"
              value={selectedLayer.strokeWidth}
              min={0}
              max={30}
              unit="px"
              defaultValue={0}
              onChange={(strokeWidth) =>
                updateTextLayer(selectedLayer.id, { strokeWidth })
              }
            />
            {selectedLayer.strokeWidth > 0 && (
              <ColorPicker
                label="Stroke Color"
                value={selectedLayer.strokeColor}
                onChange={(strokeColor) =>
                  updateTextLayer(selectedLayer.id, { strokeColor })
                }
              />
            )}
          </div>

          {/* Shadow Options */}
          <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Drop Shadow</span>
              <input
                type="checkbox"
                checked={selectedLayer.shadow.enabled}
                onChange={(e) =>
                  updateTextLayer(selectedLayer.id, {
                    shadow: { ...selectedLayer.shadow, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {selectedLayer.shadow.enabled && (
              <div className="space-y-2.5 pt-1">
                <ColorPicker
                  label="Shadow Color"
                  value={selectedLayer.shadow.color}
                  onChange={(color) =>
                    updateTextLayer(selectedLayer.id, {
                      shadow: { ...selectedLayer.shadow, color },
                    })
                  }
                />
                <SliderControl
                  label="Shadow Blur"
                  value={selectedLayer.shadow.blur}
                  min={0}
                  max={40}
                  unit="px"
                  defaultValue={6}
                  onChange={(blur) =>
                    updateTextLayer(selectedLayer.id, {
                      shadow: { ...selectedLayer.shadow, blur },
                    })
                  }
                />
              </div>
            )}
          </div>

          {/* Background Pill / Box */}
          <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Background Box / Pill</span>
              <input
                type="checkbox"
                checked={selectedLayer.backgroundBox.enabled}
                onChange={(e) =>
                  updateTextLayer(selectedLayer.id, {
                    backgroundBox: {
                      ...selectedLayer.backgroundBox,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {selectedLayer.backgroundBox.enabled && (
              <div className="space-y-2.5 pt-1">
                <ColorPicker
                  label="Box Background Color"
                  value={selectedLayer.backgroundBox.color}
                  onChange={(color) =>
                    updateTextLayer(selectedLayer.id, {
                      backgroundBox: { ...selectedLayer.backgroundBox, color },
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <SliderControl
                    label="Padding X"
                    value={selectedLayer.backgroundBox.paddingX}
                    min={0}
                    max={60}
                    unit="px"
                    onChange={(paddingX) =>
                      updateTextLayer(selectedLayer.id, {
                        backgroundBox: { ...selectedLayer.backgroundBox, paddingX },
                      })
                    }
                  />
                  <SliderControl
                    label="Padding Y"
                    value={selectedLayer.backgroundBox.paddingY}
                    min={0}
                    max={40}
                    unit="px"
                    onChange={(paddingY) =>
                      updateTextLayer(selectedLayer.id, {
                        backgroundBox: { ...selectedLayer.backgroundBox, paddingY },
                      })
                    }
                  />
                </div>
                <SliderControl
                  label="Border Radius"
                  value={selectedLayer.backgroundBox.borderRadius}
                  min={0}
                  max={60}
                  unit="px"
                  onChange={(borderRadius) =>
                    updateTextLayer(selectedLayer.id, {
                      backgroundBox: { ...selectedLayer.backgroundBox, borderRadius },
                    })
                  }
                />
              </div>
            )}
          </div>

          {/* Text Width & Centering */}
          <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <SliderControl
              label="Text Box Width"
              value={selectedLayer.maxWidth || Math.round(template.dimensions.width * 0.9)}
              min={100}
              max={template.dimensions.width}
              unit="px"
              onChange={(maxWidth) => updateTextLayer(selectedLayer.id, { maxWidth })}
            />

            <SliderControl
              label="Rotation"
              value={selectedLayer.rotation}
              min={-180}
              max={180}
              unit="°"
              defaultValue={0}
              onReset={() => updateTextLayer(selectedLayer.id, { rotation: 0 })}
              onChange={(rotation) => updateTextLayer(selectedLayer.id, { rotation })}
            />

            <button
              onClick={() =>
                updateTextLayer(selectedLayer.id, {
                  x: Math.round(template.dimensions.width / 2),
                })
              }
              className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              Center Horizontally on Canvas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
