import React, { useRef } from 'react';
import {
  Maximize2,
  UploadCloud,
  ShieldCheck,
  Trash2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Info,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { ASPECT_RATIO_PRESETS } from '../../presets/defaultTemplates';
import { ColorPicker } from '../common/ColorPicker';
import { SliderControl } from '../common/SliderControl';
import { ImageFitMode } from '../../types/studio';

interface Props {
  onOpenExifModal: () => void;
}

export const CanvasTab: React.FC<Props> = ({ onOpenExifModal }) => {
  const {
    template,
    setAspectRatio,
    updateBackground,
    uploadImage,
    removeImage,
  } = useStudio();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const bg = template.background;
  const imgState = bg.image;

  const handleFilterChange = (filterKey: keyof typeof imgState.filters, value: number) => {
    updateBackground((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        filters: {
          ...prev.image.filters,
          [filterKey]: value,
        },
      },
    }));
  };

  const resetAllFilters = () => {
    updateBackground((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          grayscale: 0,
          sepia: 0,
          invert: 0,
          hueRotate: 0,
          vignette: 0,
        },
      },
    }));
  };

  return (
    <div className="space-y-5">
      {/* 1. Aspect Ratio Presets */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
            Aspect Ratio & Size
          </span>
          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            {template.dimensions.width} × {template.dimensions.height} px
          </span>
        </label>

        <div className="grid grid-cols-4 gap-1.5">
          {ASPECT_RATIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setAspectRatio(preset.ratio)}
              className={`p-2 rounded-lg border text-center transition-all ${
                template.aspectRatio === preset.ratio
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="text-xs font-bold font-mono">{preset.iconLabel}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                {preset.name.split(' ')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Background Type Switcher: Image comes first */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-800">Background Layer</label>
        <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {(['image', 'color', 'gradient', 'transparent'] as const).map((type) => (
            <button
              key={type}
              onClick={() => updateBackground({ type })}
              className={`py-1.5 rounded-lg font-medium capitalize transition-all ${
                bg.type === type
                  ? 'bg-white text-emerald-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Image Background */}
        {bg.type === 'image' && (
          <div className="space-y-4 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {!imgState.url ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-white rounded-xl p-6 text-center cursor-pointer transition-all space-y-2 group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Click or Drag Image to Upload
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    PNG, JPG, WEBP • Auto-stripped EXIF & GPS
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Image Status Header & EXIF Badge */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[150px]">
                      {imgState.originalName || 'Background Image'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200"
                      >
                        Replace
                      </button>
                      <button
                        onClick={removeImage}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* EXIF Stripping Status Badge */}
                  <div
                    onClick={onOpenExifModal}
                    className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-emerald-700 text-xs cursor-pointer hover:bg-emerald-100/70 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      Metadata & GPS Stripped Safely
                    </span>
                    <Info className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>

                {/* Image Fit Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Fitting Mode</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    {(['cover', 'contain', 'fill'] as ImageFitMode[]).map((fit) => (
                      <button
                        key={fit}
                        onClick={() =>
                          updateBackground((prev) => ({
                            ...prev,
                            image: { ...prev.image, fit },
                          }))
                        }
                        className={`py-1 rounded-lg font-medium capitalize transition-all ${
                          imgState.fit === fit
                            ? 'bg-white text-emerald-600 font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {fit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transform & Position Sliders */}
                <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <SliderControl
                    label="Image Zoom"
                    value={Math.round(imgState.zoom * 100)}
                    min={10}
                    max={300}
                    unit="%"
                    defaultValue={100}
                    onReset={() =>
                      updateBackground((prev) => ({
                        ...prev,
                        image: { ...prev.image, zoom: 1 },
                      }))
                    }
                    onChange={(val) =>
                      updateBackground((prev) => ({
                        ...prev,
                        image: { ...prev.image, zoom: val / 100 },
                      }))
                    }
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <SliderControl
                      label="Offset X"
                      value={imgState.offsetX}
                      min={-100}
                      max={100}
                      unit="%"
                      defaultValue={0}
                      onReset={() =>
                        updateBackground((prev) => ({
                          ...prev,
                          image: { ...prev.image, offsetX: 0 },
                        }))
                      }
                      onChange={(offsetX) =>
                        updateBackground((prev) => ({
                          ...prev,
                          image: { ...prev.image, offsetX },
                        }))
                      }
                    />
                    <SliderControl
                      label="Offset Y"
                      value={imgState.offsetY}
                      min={-100}
                      max={100}
                      unit="%"
                      defaultValue={0}
                      onReset={() =>
                        updateBackground((prev) => ({
                          ...prev,
                          image: { ...prev.image, offsetY: 0 },
                        }))
                      }
                      onChange={(offsetY) =>
                        updateBackground((prev) => ({
                          ...prev,
                          image: { ...prev.image, offsetY },
                        }))
                      }
                    />
                  </div>

                  {/* Rotate & Flip Quick Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-xs text-slate-600 font-medium">Orientation</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateBackground((prev) => ({
                            ...prev,
                            image: {
                              ...prev.image,
                              rotation: (prev.image.rotation + 90) % 360,
                            },
                          }))
                        }
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors text-xs flex items-center gap-1 shadow-2xs"
                        title="Rotate 90°"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>90°</span>
                      </button>
                      <button
                        onClick={() =>
                          updateBackground((prev) => ({
                            ...prev,
                            image: {
                              ...prev.image,
                              flipH: !prev.image.flipH,
                            },
                          }))
                        }
                        className={`p-1.5 rounded-lg border transition-colors ${
                          imgState.flipH
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                        }`}
                        title="Flip Horizontal"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          updateBackground((prev) => ({
                            ...prev,
                            image: {
                              ...prev.image,
                              flipV: !prev.image.flipV,
                            },
                          }))
                        }
                        className={`p-1.5 rounded-lg border transition-colors ${
                          imgState.flipV
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                        }`}
                        title="Flip Vertical"
                      >
                        <FlipVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filters & Adjustments */}
                <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      Image Filters
                    </span>
                    <button
                      onClick={resetAllFilters}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 underline font-medium"
                    >
                      Reset All
                    </button>
                  </div>

                  <SliderControl
                    label="Brightness"
                    value={imgState.filters.brightness}
                    min={0}
                    max={200}
                    unit="%"
                    defaultValue={100}
                    onChange={(val) => handleFilterChange('brightness', val)}
                  />

                  <SliderControl
                    label="Contrast"
                    value={imgState.filters.contrast}
                    min={0}
                    max={200}
                    unit="%"
                    defaultValue={100}
                    onChange={(val) => handleFilterChange('contrast', val)}
                  />

                  <SliderControl
                    label="Saturation"
                    value={imgState.filters.saturation}
                    min={0}
                    max={200}
                    unit="%"
                    defaultValue={100}
                    onChange={(val) => handleFilterChange('saturation', val)}
                  />

                  <SliderControl
                    label="Blur"
                    value={imgState.filters.blur}
                    min={0}
                    max={30}
                    unit="px"
                    defaultValue={0}
                    onChange={(val) => handleFilterChange('blur', val)}
                  />

                  <SliderControl
                    label="Grayscale"
                    value={imgState.filters.grayscale}
                    min={0}
                    max={100}
                    unit="%"
                    defaultValue={0}
                    onChange={(val) => handleFilterChange('grayscale', val)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Color Background */}
        {bg.type === 'color' && (
          <div className="pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <ColorPicker
              label="Solid Background Color"
              value={bg.color}
              onChange={(color) => updateBackground({ color })}
            />
          </div>
        )}

        {/* Gradient Background */}
        {bg.type === 'gradient' && (
          <div className="space-y-3 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="space-y-2.5">
              <ColorPicker
                label="Gradient Color 1"
                value={bg.gradient.colors[0]}
                onChange={(c) =>
                  updateBackground({
                    gradient: { ...bg.gradient, colors: [c, bg.gradient.colors[1]] },
                  })
                }
              />
              <ColorPicker
                label="Gradient Color 2"
                value={bg.gradient.colors[1]}
                onChange={(c) =>
                  updateBackground({
                    gradient: { ...bg.gradient, colors: [bg.gradient.colors[0], c] },
                  })
                }
              />
            </div>
            <SliderControl
              label="Gradient Angle"
              value={bg.gradient.angle}
              min={0}
              max={360}
              unit="°"
              onChange={(angle) =>
                updateBackground({ gradient: { ...bg.gradient, angle } })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
