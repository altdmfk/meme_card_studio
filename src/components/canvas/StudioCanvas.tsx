import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { renderStudioCanvas, preloadImage } from '../../core/canvas/CanvasRenderer';
import { useCanvasInteractive } from '../../hooks/useCanvasInteractive';
import { CanvasOverlayGuides } from './CanvasOverlayGuides';
import { LayerTransformer } from './LayerTransformer';

export const StudioCanvas: React.FC = () => {
  const {
    template,
    selectedLayerId,
    selectedLayerType,
    setSelectedLayerId,
    updateTextLayer,
    deleteTextLayer,
    duplicateTextLayer,
    updateSticker,
    deleteSticker,
    zoom,
    isFitToScreen,
    showGuides,
  } = useStudio();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const [renderLatencyMs, setRenderLatencyMs] = useState<number>(0);

  // Monitor container resize
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute display dimensions based on fit-to-screen or zoom multiplier
  const { width: logicalW, height: logicalH } = template.dimensions;
  const padding = 48;
  const availableW = Math.max(containerSize.width - padding, 100);
  const availableH = Math.max(containerSize.height - padding, 100);

  const scaleFit = Math.min(availableW / logicalW, availableH / logicalH);
  const finalDisplayScale = isFitToScreen ? scaleFit : zoom;

  const displayWidth = Math.round(logicalW * finalDisplayScale);
  const displayHeight = Math.round(logicalH * finalDisplayScale);

  // Interactive Drag & Drop Hook
  const { handleMouseDown, handleMouseMove, handleMouseUp, isDragging, hoveredLayerId } =
    useCanvasInteractive(
      template,
      canvasRef,
      selectedLayerId,
      setSelectedLayerId,
      updateTextLayer,
      updateSticker,
      finalDisplayScale
    );

  // Core DPR Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;
    const startTime = performance.now();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const render = () => {
      if (!isMounted) return;
      renderStudioCanvas(ctx, template, logicalW, logicalH);
      const elapsed = performance.now() - startTime;
      setRenderLatencyMs(Math.round(elapsed * 10) / 10);

      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect());
      }
    };

    if (template.background.image.url) {
      preloadImage(template.background.image.url)
        .then(() => render())
        .catch(() => render());
    } else {
      render();
    }

    return () => {
      isMounted = false;
    };
  }, [template, logicalW, logicalH]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasRect(canvasRef.current.getBoundingClientRect());
    }
  }, [displayWidth, displayHeight, zoom, isFitToScreen]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full bg-slate-100/90 overflow-hidden flex items-center justify-center p-6 select-none"
    >
      {/* Centered Canvas Container */}
      <div
        className="relative shadow-lg rounded-lg transition-all duration-100 ease-out flex items-center justify-center border border-slate-300/80"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
      >
        {/* Transparent Checkerboard Pattern Backdrop */}
        <div className="absolute inset-0 canvas-checkerboard rounded-lg shadow-inner" />

        {/* The Live HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative z-10 rounded-lg ${
            isDragging
              ? 'cursor-grabbing'
              : hoveredLayerId
              ? 'cursor-grab'
              : 'cursor-default'
          }`}
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
          }}
        />

        {/* Overlay Guides */}
        <CanvasOverlayGuides template={template} showGuides={showGuides} />

        {/* Interactive Transformer Handles */}
        <LayerTransformer
          template={template}
          selectedLayerId={selectedLayerId}
          selectedLayerType={selectedLayerType}
          canvasRect={canvasRect}
          onUpdateText={updateTextLayer}
          onDeleteText={deleteTextLayer}
          onDuplicateText={duplicateTextLayer}
          onDeleteSticker={deleteSticker}
          onUpdateSticker={updateSticker}
        />
      </div>

      {/* Floating Canvas Stats Pill */}
      <div className="absolute bottom-4 left-6 z-20 flex items-center gap-2.5 bg-white/95 border border-slate-200 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-mono text-slate-600 shadow-sm pointer-events-none">
        <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {template.aspectRatio.toUpperCase()} • {logicalW} × {logicalH} px
        </span>
        <span className="text-slate-300">|</span>
        <span>DPR: {(window.devicePixelRatio || 1).toFixed(1)}x</span>
        <span className="text-slate-300">|</span>
        <span className="text-emerald-600 font-semibold">{renderLatencyMs}ms</span>
      </div>
    </div>
  );
};
