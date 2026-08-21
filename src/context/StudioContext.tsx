import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  StudioTemplate,
  AspectRatioType,
  TextLayer,
  StickerLayer,
  BorderFrame,
  Watermark,
  ExifReport,
  BackgroundState,
  StudioTabType,
} from '../types/studio';
import { DEFAULT_TEMPLATES, ASPECT_RATIO_PRESETS, BLANK_TEMPLATE } from '../presets/defaultTemplates';
import { sanitizeImageFile } from '../core/canvas/exifCleaner';
import { validateAndParseTemplateJSON } from '../schema/templateSchema';

interface StudioContextType {
  template: StudioTemplate;
  savedTemplates: StudioTemplate[];
  selectedLayerId: string | null;
  selectedLayerType: 'text' | 'sticker' | null;
  activeTab: StudioTabType;
  zoom: number;
  isFitToScreen: boolean;
  showGuides: boolean;
  lastExifReport: ExifReport | null;
  canUndo: boolean;
  canRedo: boolean;
  
  // Tab & Selection Actions
  setActiveTab: (tab: StudioTabType) => void;
  setSelectedLayerId: (id: string | null, type?: 'text' | 'sticker') => void;
  setZoom: (zoom: number) => void;
  setIsFitToScreen: (fit: boolean) => void;
  setShowGuides: (show: boolean) => void;
  clearExifReport: () => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  
  // Template CRUD & Canvas Actions
  setAspectRatio: (ratio: AspectRatioType, customW?: number, customH?: number) => void;
  updateBackground: (partial: Partial<BackgroundState> | ((prev: BackgroundState) => BackgroundState)) => void;
  uploadImage: (file: File) => Promise<ExifReport>;
  removeImage: () => void;
  
  // Text Layer CRUD
  addTextLayer: (presetText?: string) => string;
  updateTextLayer: (id: string, partial: Partial<TextLayer>) => void;
  deleteTextLayer: (id: string) => void;
  duplicateTextLayer: (id: string) => void;
  reorderTextLayer: (id: string, direction: 'up' | 'down') => void;
  
  // Sticker CRUD
  addSticker: (content: string, type?: StickerLayer['type']) => string;
  updateSticker: (id: string, partial: Partial<StickerLayer>) => void;
  deleteSticker: (id: string) => void;
  
  // Decoration Actions
  updateFrame: (partial: Partial<BorderFrame>) => void;
  updateWatermark: (partial: Partial<Watermark>) => void;

  // Template CRUD (LocalStorage)
  loadTemplate: (template: StudioTemplate) => void;
  saveCurrentAsTemplate: (name: string, category?: StudioTemplate['category']) => StudioTemplate;
  updateSavedTemplate: (id: string) => void;
  renameSavedTemplate: (id: string, newName: string) => void;
  deleteSavedTemplate: (id: string) => void;
  duplicateSavedTemplate: (id: string) => void;
  importTemplatesFromJSON: (jsonString: string) => { success: boolean; count: number; errors: string[] };
  exportTemplatesToJSON: () => string;
  resetCanvas: () => void;
  clearAllStorageData: () => void;
}

const STORAGE_KEY_SAVED_TEMPLATES = 'meme_card_studio_saved_templates_v1';
const STORAGE_KEY_CURRENT_DRAFT = 'meme_card_studio_draft_v1';

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize current template from localStorage draft or Blank Canvas
  const [template, setTemplate] = useState<StudioTemplate>(() => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY_CURRENT_DRAFT);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed && parsed.dimensions && parsed.textLayers) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load draft template from storage', e);
    }
    return JSON.parse(JSON.stringify(BLANK_TEMPLATE));
  });

  // Initialize saved templates from localStorage
  const [savedTemplates, setSavedTemplates] = useState<StudioTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_TEMPLATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved templates', e);
    }
    return [];
  });

  // History stack for Undo / Redo
  const [history, setHistory] = useState<StudioTemplate[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isUndoRedoAction = useRef(false);

  // UI state: Canvas tab is default
  const [selectedLayerId, setSelectedLayerIdState] = useState<string | null>(null);
  const [selectedLayerType, setSelectedLayerType] = useState<'text' | 'sticker' | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTabType>('canvas');
  const [zoom, setZoom] = useState<number>(1);
  const [isFitToScreen, setIsFitToScreen] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [lastExifReport, setLastExifReport] = useState<ExifReport | null>(null);

  // Sync saved templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_TEMPLATES, JSON.stringify(savedTemplates));
    } catch (e) {
      console.error('LocalStorage quota exceeded for saved templates', e);
    }
  }, [savedTemplates]);

  // Debounced auto-save current draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_CURRENT_DRAFT, JSON.stringify(template));
      } catch (e) {
        console.warn('Could not auto-save current draft', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [template]);

  // Push state to history stack
  const pushHistory = useCallback((newTemplate: StudioTemplate) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      const next = [...sliced, JSON.parse(JSON.stringify(newTemplate))];
      if (next.length > 30) next.shift();
      return next;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  }, [historyIndex]);

  const updateTemplateState = useCallback((updater: (prev: StudioTemplate) => StudioTemplate) => {
    setTemplate((prev) => {
      const next = updater(prev);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const setSelectedLayerId = useCallback((id: string | null, type?: 'text' | 'sticker') => {
    setSelectedLayerIdState(id);
    if (!id) {
      setSelectedLayerType(null);
    } else if (type) {
      setSelectedLayerType(type);
    } else {
      const isText = template.textLayers.some(l => l.id === id);
      setSelectedLayerType(isText ? 'text' : 'sticker');
    }
  }, [template]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const targetIndex = historyIndex - 1;
      const targetState = history[targetIndex];
      if (targetState) {
        setTemplate(JSON.parse(JSON.stringify(targetState)));
        setHistoryIndex(targetIndex);
      }
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const targetIndex = historyIndex + 1;
      const targetState = history[targetIndex];
      if (targetState) {
        setTemplate(JSON.parse(JSON.stringify(targetState)));
        setHistoryIndex(targetIndex);
      }
    }
  }, [history, historyIndex]);

  // Set Aspect Ratio
  const setAspectRatio = useCallback((ratio: AspectRatioType, customW?: number, customH?: number) => {
    let targetW = 1080;
    let targetH = 1080;

    if (ratio === 'custom' && customW && customH) {
      targetW = customW;
      targetH = customH;
    } else {
      const preset = ASPECT_RATIO_PRESETS.find(p => p.ratio === ratio);
      if (preset) {
        targetW = preset.width;
        targetH = preset.height;
      }
    }

    updateTemplateState((prev) => {
      const scaleX = targetW / prev.dimensions.width;
      const scaleY = targetH / prev.dimensions.height;

      const nextTextLayers = prev.textLayers.map((layer) => ({
        ...layer,
        x: Math.round(layer.x * scaleX),
        y: Math.round(layer.y * scaleY),
        maxWidth: layer.maxWidth ? Math.round(layer.maxWidth * scaleX) : undefined,
      }));

      const nextStickers = prev.stickers.map((stk) => ({
        ...stk,
        x: Math.round(stk.x * scaleX),
        y: Math.round(stk.y * scaleY),
      }));

      return {
        ...prev,
        aspectRatio: ratio,
        dimensions: { width: targetW, height: targetH },
        textLayers: nextTextLayers,
        stickers: nextStickers,
        updatedAt: Date.now(),
      };
    });
  }, [updateTemplateState]);

  // Background updates
  const updateBackground = useCallback((partial: Partial<BackgroundState> | ((prev: BackgroundState) => BackgroundState)) => {
    updateTemplateState((prev) => {
      const newBg = typeof partial === 'function' ? partial(prev.background) : { ...prev.background, ...partial };
      return { ...prev, background: newBg, updatedAt: Date.now() };
    });
  }, [updateTemplateState]);

  // Image upload with EXIF sanitization
  const uploadImage = useCallback(async (file: File): Promise<ExifReport> => {
    const { sanitizedUrl, report } = await sanitizeImageFile(file);
    setLastExifReport(report);

    updateTemplateState((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        type: 'image',
        image: {
          ...prev.background.image,
          url: sanitizedUrl,
          originalName: file.name,
          exifStripped: true,
          rawExifFound: report.tagsFound,
        },
      },
      updatedAt: Date.now(),
    }));

    return report;
  }, [updateTemplateState]);

  const removeImage = useCallback(() => {
    updateTemplateState((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        type: 'color',
        image: {
          ...prev.background.image,
          url: null,
          originalName: undefined,
          exifStripped: false,
          rawExifFound: [],
        },
      },
      updatedAt: Date.now(),
    }));
  }, [updateTemplateState]);

  // Text Layer CRUD: Blank by default so user doesn't have to backspace
  const addTextLayer = useCallback((presetText?: string): string => {
    const id = `txt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newLayer: TextLayer = {
      id,
      name: `Text Layer ${template.textLayers.length + 1}`,
      text: presetText !== undefined ? presetText : '',
      x: Math.round(template.dimensions.width / 2),
      y: Math.round(template.dimensions.height / 2),
      rotation: 0,
      fontFamily: 'Inter',
      fontSize: 48,
      fontWeight: '700',
      fontStyle: 'normal',
      color: '#0f172a',
      opacity: 1,
      align: 'center',
      verticalAlign: 'middle',
      lineHeight: 1.2,
      letterSpacing: 0,
      transform: 'none',
      strokeWidth: 0,
      strokeColor: '#000000',
      shadow: { enabled: false, color: 'rgba(0,0,0,0.4)', blur: 8, offsetX: 0, offsetY: 4 },
      backgroundBox: { enabled: false, color: 'rgba(0,0,0,0.7)', paddingX: 20, paddingY: 10, borderRadius: 8, borderWidth: 0, borderColor: '#fff' },
      maxWidth: Math.round(template.dimensions.width * 0.8),
      autoScale: false,
      visible: true,
      locked: false,
      zIndex: template.textLayers.length + 1,
    };

    updateTemplateState((prev) => ({
      ...prev,
      textLayers: [...prev.textLayers, newLayer],
      updatedAt: Date.now(),
    }));

    setSelectedLayerId(id, 'text');
    setActiveTab('text');
    return id;
  }, [template.dimensions, template.textLayers.length, updateTemplateState, setSelectedLayerId]);

  const updateTextLayer = useCallback((id: string, partial: Partial<TextLayer>) => {
    updateTemplateState((prev) => ({
      ...prev,
      textLayers: prev.textLayers.map((l) => (l.id === id ? { ...l, ...partial } : l)),
      updatedAt: Date.now(),
    }));
  }, [updateTemplateState]);

  const deleteTextLayer = useCallback((id: string) => {
    updateTemplateState((prev) => ({
      ...prev,
      textLayers: prev.textLayers.filter((l) => l.id !== id),
      updatedAt: Date.now(),
    }));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  }, [selectedLayerId, setSelectedLayerId, updateTemplateState]);

  const duplicateTextLayer = useCallback((id: string) => {
    const target = template.textLayers.find((l) => l.id === id);
    if (!target) return;

    const newId = `txt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const duplicated: TextLayer = {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      x: target.x + 30,
      y: target.y + 30,
      zIndex: template.textLayers.length + 1,
    };

    updateTemplateState((prev) => ({
      ...prev,
      textLayers: [...prev.textLayers, duplicated],
      updatedAt: Date.now(),
    }));

    setSelectedLayerId(newId, 'text');
  }, [template.textLayers, updateTemplateState, setSelectedLayerId]);

  const reorderTextLayer = useCallback((id: string, direction: 'up' | 'down') => {
    updateTemplateState((prev) => {
      const index = prev.textLayers.findIndex((l) => l.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === prev.textLayers.length - 1) return prev;
      if (direction === 'down' && index === 0) return prev;

      const newLayers = [...prev.textLayers];
      const targetIndex = direction === 'up' ? index + 1 : index - 1;
      const [moved] = newLayers.splice(index, 1);
      newLayers.splice(targetIndex, 0, moved);

      return {
        ...prev,
        textLayers: newLayers.map((l, i) => ({ ...l, zIndex: i + 1 })),
        updatedAt: Date.now(),
      };
    });
  }, [updateTemplateState]);

  // Sticker CRUD
  const addSticker = useCallback((content: string, type: StickerLayer['type'] = 'emoji'): string => {
    const id = `stk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newSticker: StickerLayer = {
      id,
      type,
      content,
      x: Math.round(template.dimensions.width / 2),
      y: Math.round(template.dimensions.height / 2),
      size: 90,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: template.stickers.length + 1,
    };

    updateTemplateState((prev) => ({
      ...prev,
      stickers: [...prev.stickers, newSticker],
      updatedAt: Date.now(),
    }));

    setSelectedLayerId(id, 'sticker');
    return id;
  }, [template.dimensions, template.stickers.length, updateTemplateState, setSelectedLayerId]);

  const updateSticker = useCallback((id: string, partial: Partial<StickerLayer>) => {
    updateTemplateState((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => (s.id === id ? { ...s, ...partial } : s)),
      updatedAt: Date.now(),
    }));
  }, [updateTemplateState]);

  const deleteSticker = useCallback((id: string) => {
    updateTemplateState((prev) => ({
      ...prev,
      stickers: prev.stickers.filter((s) => s.id !== id),
      updatedAt: Date.now(),
    }));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  }, [selectedLayerId, setSelectedLayerId, updateTemplateState]);

  // Frame & Watermark Updates
  const updateFrame = useCallback((partial: Partial<BorderFrame>) => {
    updateTemplateState((prev) => ({
      ...prev,
      frame: { ...prev.frame, ...partial },
      updatedAt: Date.now(),
    }));
  }, [updateTemplateState]);

  const updateWatermark = useCallback((partial: Partial<Watermark>) => {
    updateTemplateState((prev) => ({
      ...prev,
      watermark: { ...prev.watermark, ...partial },
      updatedAt: Date.now(),
    }));
  }, [updateTemplateState]);

  // Template Library Management: Auto-save previous modifications before switching templates
  const loadTemplate = useCallback((tpl: StudioTemplate) => {
    const hasModifications =
      template.textLayers.some((l) => l.text.trim()) ||
      template.background.image.url !== null ||
      template.stickers.length > 0;

    if (hasModifications && template.id !== tpl.id) {
      // Auto-save current work into saved templates so it is never lost
      const draftName =
        template.name && template.name !== 'Blank Canvas'
          ? template.name
          : `Saved Draft (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

      setSavedTemplates((prev) => {
        const existingIndex = prev.findIndex((t) => t.id === template.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...JSON.parse(JSON.stringify(template)),
            updatedAt: Date.now(),
          };
          return updated;
        } else {
          const autoDraft: StudioTemplate = {
            ...JSON.parse(JSON.stringify(template)),
            id: `draft-${Date.now()}`,
            name: draftName,
            category: 'custom',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return [autoDraft, ...prev];
        }
      });
    }

    // Push to history stack for instantaneous Ctrl+Z undo
    pushHistory(template);

    const cloned = JSON.parse(JSON.stringify(tpl));
    setTemplate(cloned);
    pushHistory(cloned);
    setSelectedLayerId(null);
  }, [template, pushHistory, setSelectedLayerId]);

  const saveCurrentAsTemplate = useCallback((name: string, category: StudioTemplate['category'] = 'custom'): StudioTemplate => {
    const cleanName = name.trim() || 'My Custom Template';
    const newTemplate: StudioTemplate = {
      ...JSON.parse(JSON.stringify(template)),
      id: `custom-tpl-${Date.now()}`,
      name: cleanName,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSavedTemplates((prev) => [newTemplate, ...prev]);
    return newTemplate;
  }, [template]);

  const updateSavedTemplate = useCallback((id: string) => {
    setSavedTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...JSON.parse(JSON.stringify(template)),
            id,
            name: t.name,
            category: t.category,
            updatedAt: Date.now(),
          };
        }
        return t;
      })
    );
  }, [template]);

  const renameSavedTemplate = useCallback((id: string, newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return;

    setSavedTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: cleanName, updatedAt: Date.now() } : t))
    );

    setTemplate((prev) => {
      if (prev.id === id) {
        return { ...prev, name: cleanName, updatedAt: Date.now() };
      }
      return prev;
    });
  }, []);

  const deleteSavedTemplate = useCallback((id: string) => {
    setSavedTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const duplicateSavedTemplate = useCallback((id: string) => {
    const target = savedTemplates.find((t) => t.id === id);
    if (!target) return;
    const duplicated: StudioTemplate = {
      ...JSON.parse(JSON.stringify(target)),
      id: `custom-tpl-${Date.now()}`,
      name: `${target.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSavedTemplates((prev) => [duplicated, ...prev]);
  }, [savedTemplates]);

  // Import / Export JSON
  const importTemplatesFromJSON = useCallback((jsonString: string): { success: boolean; count: number; errors: string[] } => {
    const result = validateAndParseTemplateJSON(jsonString);

    if (!result.success) {
      return { success: false, count: 0, errors: result.errors };
    }

    if (result.bundle && result.bundle.length > 0) {
      setSavedTemplates((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newItems: StudioTemplate[] = [];

        for (const importedTpl of result.bundle!) {
          let uniqueId = importedTpl.id;
          if (existingIds.has(uniqueId)) {
            uniqueId = `${uniqueId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          }
          existingIds.add(uniqueId);
          newItems.push({
            ...importedTpl,
            id: uniqueId,
          });
        }

        return [...newItems, ...prev];
      });

      return { success: true, count: result.bundle.length, errors: [] };
    }

    if (result.template) {
      const imported = result.template;
      const uniqueId = `imported-${Date.now()}`;
      const safeTpl = { ...imported, id: uniqueId };

      setSavedTemplates((prev) => [safeTpl, ...prev]);
      loadTemplate(safeTpl);
      return { success: true, count: 1, errors: [] };
    }

    return { success: false, count: 0, errors: ['Unknown template format'] };
  }, [loadTemplate]);

  const exportTemplatesToJSON = useCallback((): string => {
    // Deduplicate templates by ID so current template is never exported twice
    const templateMap = new Map<string, StudioTemplate>();
    
    // Always include current active canvas template
    templateMap.set(template.id, template);

    // Add saved templates only if not already present
    for (const saved of savedTemplates) {
      if (!templateMap.has(saved.id)) {
        templateMap.set(saved.id, saved);
      }
    }

    const bundle = {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      app: 'MemeAndCardStudio',
      templates: Array.from(templateMap.values()),
    };
    return JSON.stringify(bundle, null, 2);
  }, [template, savedTemplates]);

  const resetCanvas = useCallback(() => {
    const cleanBlank = JSON.parse(JSON.stringify(BLANK_TEMPLATE));
    setTemplate(cleanBlank);
    pushHistory(cleanBlank);
    setSelectedLayerId(null);
  }, [pushHistory, setSelectedLayerId]);

  const clearAllStorageData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_SAVED_TEMPLATES);
      localStorage.removeItem(STORAGE_KEY_CURRENT_DRAFT);
      localStorage.clear();
    } catch (e) {
      console.warn('Failed to clear localStorage', e);
    }
    setSavedTemplates([]);
    const cleanBlank = JSON.parse(JSON.stringify(BLANK_TEMPLATE));
    setTemplate(cleanBlank);
    setHistory([cleanBlank]);
    setHistoryIndex(0);
    setSelectedLayerId(null);
  }, [setSelectedLayerId]);

  const value: StudioContextType = {
    template,
    savedTemplates,
    selectedLayerId,
    selectedLayerType,
    activeTab,
    zoom,
    isFitToScreen,
    showGuides,
    lastExifReport,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,

    setActiveTab,
    setSelectedLayerId,
    setZoom,
    setIsFitToScreen,
    setShowGuides,
    clearExifReport: () => setLastExifReport(null),

    undo,
    redo,

    setAspectRatio,
    updateBackground,
    uploadImage,
    removeImage,

    addTextLayer,
    updateTextLayer,
    deleteTextLayer,
    duplicateTextLayer,
    reorderTextLayer,

    addSticker,
    updateSticker,
    deleteSticker,

    updateFrame,
    updateWatermark,

    loadTemplate,
    saveCurrentAsTemplate,
    updateSavedTemplate,
    renameSavedTemplate,
    deleteSavedTemplate,
    duplicateSavedTemplate,
    importTemplatesFromJSON,
    exportTemplatesToJSON,
    resetCanvas,
    clearAllStorageData,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

export const useStudio = (): StudioContextType => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
