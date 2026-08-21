import { useState, useCallback, useRef, useEffect } from 'react';
import { StudioTemplate, TextLayer, StickerLayer } from '../types/studio';
import { computeTextLayout } from '../core/canvas/textEngine';

interface TransformHandle {
  type: 'move' | 'rotate' | 'resize-e' | 'resize-w' | 'resize-corner';
  layerId: string;
  initialMouseX: number;
  initialMouseY: number;
  initialLayerX: number;
  initialLayerY: number;
  initialRotation: number;
  initialFontSize: number;
  initialMaxWidth: number;
}

export function useCanvasInteractive(
  template: StudioTemplate,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  selectedLayerId: string | null,
  setSelectedLayerId: (id: string | null, type?: 'text' | 'sticker') => void,
  updateTextLayer: (id: string, partial: Partial<TextLayer>) => void,
  updateSticker: (id: string, partial: Partial<StickerLayer>) => void,
  displayScale: number
) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<TransformHandle | null>(null);
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);

  // Convert client mouse event coordinates to virtual canvas pixel coordinates
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();

      const scaleX = template.dimensions.width / rect.width;
      const scaleY = template.dimensions.height / rect.height;

      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      return { x, y };
    },
    [canvasRef, template.dimensions]
  );

  // Check if coordinates hit a text layer
  const hitTestTextLayer = useCallback(
    (coords: { x: number; y: number }, layer: TextLayer): boolean => {
      if (!layer.visible) return false;

      // Distance check from layer anchor
      const dx = coords.x - layer.x;
      const dy = coords.y - layer.y;

      // Rotate point inversely to account for layer rotation
      const rad = (-layer.rotation * Math.PI) / 180;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad);

      // Approximate text layer box size
      const approxWidth = layer.maxWidth || 400;
      const approxHeight = layer.fontSize * layer.lineHeight * 2;
      const halfW = approxWidth / 2;
      const halfH = approxHeight / 2;

      return Math.abs(rx) <= halfW && Math.abs(ry) <= halfH;
    },
    []
  );

  // Handle Mouse Down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      if (!coords) return;

      // Check text layers (top to bottom by zIndex)
      const sortedTextLayers = [...template.textLayers].sort((a, b) => b.zIndex - a.zIndex);
      for (const layer of sortedTextLayers) {
        if (layer.locked) continue;
        if (hitTestTextLayer(coords, layer)) {
          setSelectedLayerId(layer.id, 'text');
          setActiveHandle({
            type: 'move',
            layerId: layer.id,
            initialMouseX: coords.x,
            initialMouseY: coords.y,
            initialLayerX: layer.x,
            initialLayerY: layer.y,
            initialRotation: layer.rotation,
            initialFontSize: layer.fontSize,
            initialMaxWidth: layer.maxWidth || template.dimensions.width * 0.8,
          });
          setIsDragging(true);
          return;
        }
      }

      // Check stickers
      for (const sticker of template.stickers) {
        if (sticker.locked || !sticker.visible) continue;
        const dist = Math.hypot(coords.x - sticker.x, coords.y - sticker.y);
        if (dist <= sticker.size) {
          setSelectedLayerId(sticker.id, 'sticker');
          setActiveHandle({
            type: 'move',
            layerId: sticker.id,
            initialMouseX: coords.x,
            initialMouseY: coords.y,
            initialLayerX: sticker.x,
            initialLayerY: sticker.y,
            initialRotation: sticker.rotation,
            initialFontSize: sticker.size,
            initialMaxWidth: sticker.size,
          });
          setIsDragging(true);
          return;
        }
      }

      // Clicked on empty canvas background
      setSelectedLayerId(null);
    },
    [getCanvasCoords, hitTestTextLayer, setSelectedLayerId, template.dimensions.width, template.stickers, template.textLayers]
  );

  // Handle Mouse Move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      if (!coords) return;

      if (activeHandle && isDragging) {
        const deltaX = coords.x - activeHandle.initialMouseX;
        const deltaY = coords.y - activeHandle.initialMouseY;

        if (activeHandle.type === 'move') {
          // Check if target is a text layer or sticker
          const isText = template.textLayers.some((l) => l.id === activeHandle.layerId);
          if (isText) {
            updateTextLayer(activeHandle.layerId, {
              x: Math.round(activeHandle.initialLayerX + deltaX),
              y: Math.round(activeHandle.initialLayerY + deltaY),
            });
          } else {
            updateSticker(activeHandle.layerId, {
              x: Math.round(activeHandle.initialLayerX + deltaX),
              y: Math.round(activeHandle.initialLayerY + deltaY),
            });
          }
        }
      } else {
        // Hover inspection
        let foundHover: string | null = null;
        for (const layer of template.textLayers) {
          if (hitTestTextLayer(coords, layer)) {
            foundHover = layer.id;
            break;
          }
        }
        setHoveredLayerId(foundHover);
      }
    },
    [activeHandle, getCanvasCoords, hitTestTextLayer, isDragging, template.textLayers, updateSticker, updateTextLayer]
  );

  // Handle Mouse Up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging,
    hoveredLayerId,
  };
}
