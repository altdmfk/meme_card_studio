import { useEffect } from 'react';
import { useStudio } from '../context/StudioContext';

export function useKeyboardShortcuts() {
  const {
    undo,
    redo,
    selectedLayerId,
    selectedLayerType,
    deleteTextLayer,
    deleteSticker,
    duplicateTextLayer,
    setSelectedLayerId,
    updateTextLayer,
    updateSticker,
    template,
  } = useStudio();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when typing in an input / textarea / contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl+Z / Cmd+Z
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y / Cmd+Shift+Z
      if (
        (isCmdOrCtrl && e.key.toLowerCase() === 'y') ||
        (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Duplicate: Ctrl+D / Cmd+D
      if (isCmdOrCtrl && e.key.toLowerCase() === 'd') {
        if (selectedLayerId && selectedLayerType === 'text') {
          e.preventDefault();
          duplicateTextLayer(selectedLayerId);
        }
        return;
      }

      // Deselect: Escape
      if (e.key === 'Escape') {
        setSelectedLayerId(null);
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId) {
          e.preventDefault();
          if (selectedLayerType === 'text') {
            deleteTextLayer(selectedLayerId);
          } else {
            deleteSticker(selectedLayerId);
          }
        }
        return;
      }

      // Nudge position with Arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedLayerId) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;

        if (selectedLayerType === 'text') {
          const layer = template.textLayers.find((l) => l.id === selectedLayerId);
          if (layer) {
            updateTextLayer(selectedLayerId, { x: layer.x + dx, y: layer.y + dy });
          }
        } else if (selectedLayerType === 'sticker') {
          const sticker = template.stickers.find((s) => s.id === selectedLayerId);
          if (sticker) {
            updateSticker(selectedLayerId, { x: sticker.x + dx, y: sticker.y + dy });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    selectedLayerId,
    selectedLayerType,
    deleteTextLayer,
    deleteSticker,
    duplicateTextLayer,
    setSelectedLayerId,
    updateTextLayer,
    updateSticker,
    template.textLayers,
    template.stickers,
  ]);
}
