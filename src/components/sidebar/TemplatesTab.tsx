import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  Copy,
  Sparkles,
  FileCode2,
  Square,
  Check,
  RefreshCw,
  Edit2,
  X,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { DEFAULT_TEMPLATES, BLANK_TEMPLATE } from '../../presets/defaultTemplates';

interface Props {
  onOpenJsonModal: () => void;
}

export const TemplatesTab: React.FC<Props> = ({ onOpenJsonModal }) => {
  const {
    template,
    savedTemplates,
    loadTemplate,
    saveCurrentAsTemplate,
    updateSavedTemplate,
    renameSavedTemplate,
    deleteSavedTemplate,
    duplicateSavedTemplate,
    clearAllStorageData,
  } = useStudio();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [syncedTemplateId, setSyncedTemplateId] = useState<string | null>(null);
  
  // State for renaming a saved template
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Presets' },
    { id: 'meme', label: 'Meme' },
    { id: 'news', label: 'News' },
    { id: 'social', label: 'Social' },
    { id: 'quote', label: 'Quote' },
  ];

  const filteredPresets =
    filterCategory === 'all'
      ? DEFAULT_TEMPLATES
      : DEFAULT_TEMPLATES.filter((t) => t.category === filterCategory);

  const handleSave = () => {
    if (!newTemplateName.trim()) return;
    saveCurrentAsTemplate(newTemplateName.trim(), 'custom');
    setNewTemplateName('');
    setIsSaving(false);
  };

  const handleSync = (id: string) => {
    updateSavedTemplate(id);
    setSyncedTemplateId(id);
    setTimeout(() => setSyncedTemplateId(null), 2000);
  };

  const startRenaming = (id: string, currentName: string) => {
    setEditingTemplateId(id);
    setEditNameInput(currentName);
  };

  const saveRenaming = (id: string) => {
    if (editNameInput.trim()) {
      renameSavedTemplate(id, editNameInput.trim());
    }
    setEditingTemplateId(null);
  };

  return (
    <div className="space-y-5">
      {/* Option to Choose No Template / Blank Canvas */}
      <button
        onClick={() => loadTemplate(BLANK_TEMPLATE)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-semibold text-slate-800 transition-colors shadow-2xs group"
      >
        <Square className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
        <span>Blank Canvas (No Template)</span>
      </button>

      {/* Save Draft Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
            Save Current as Template
          </span>
          <button
            onClick={() => setIsSaving(!isSaving)}
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {isSaving ? 'Cancel' : '+ New Template'}
          </button>
        </div>

        {isSaving && (
          <div className="space-y-2 pt-1">
            <input
              type="text"
              placeholder="Template name (e.g. My Custom Template)"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              disabled={!newTemplateName.trim()}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Save Template
            </button>
          </div>
        )}
      </div>

      {/* User's Saved Templates (CRUD & Inline Renaming) */}
      {savedTemplates.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              My Saved Templates ({savedTemplates.length})
            </span>
          </div>

          <div className="space-y-2">
            {savedTemplates.map((saved) => {
              const isCurrent = template.id === saved.id;
              const isJustSynced = syncedTemplateId === saved.id;
              const isEditing = editingTemplateId === saved.id;

              return (
                <div
                  key={saved.id}
                  className={`bg-white border rounded-xl p-3 space-y-2 group shadow-2xs transition-all ${
                    isCurrent
                      ? 'border-emerald-500 ring-1 ring-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Inline Rename Form or Normal Display */}
                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={editNameInput}
                          onChange={(e) => setEditNameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRenaming(saved.id);
                            if (e.key === 'Escape') setEditingTemplateId(null);
                          }}
                          className="flex-1 bg-white border border-emerald-500 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => saveRenaming(saved.id)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          title="Save Name"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTemplateId(null)}
                          className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="flex-1 cursor-pointer min-w-0"
                        onClick={() => loadTemplate(saved)}
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors truncate">
                            {saved.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{saved.aspectRatio}</span>
                          <span>•</span>
                          <span>{saved.textLayers.length} text layers</span>
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-0.5">
                        {/* Rename Button */}
                        <button
                          onClick={() => startRenaming(saved.id, saved.name)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Rename Template"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Sync / Overwrite Button */}
                        <button
                          onClick={() => handleSync(saved.id)}
                          className={`flex items-center gap-1 py-1 px-2 rounded transition-all text-[11px] font-semibold ${
                            isJustSynced
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200'
                          }`}
                          title="Overwrite this Template with Current Canvas"
                        >
                          {isJustSynced ? (
                            <>
                              <Check className="w-3 h-3 text-white" />
                              <span>Synced ✓</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 text-slate-500 group-hover:text-emerald-600" />
                              <span>Sync</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => duplicateSavedTemplate(saved.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSavedTemplate(saved.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset Library Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Preset Library
          </span>
          <button
            onClick={onOpenJsonModal}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <FileCode2 className="w-3 h-3 text-emerald-600" />
            JSON Schema
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 gap-2">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => loadTemplate(preset)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                template.id === preset.id
                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{preset.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {preset.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded">
                  {preset.aspectRatio}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clear All Storage / Reset Button */}
      <div className="pt-2 border-t border-slate-200">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all saved templates and cache data? (This will restore the app to its initial clean state)')) {
              clearAllStorageData();
            }
          }}
          className="w-full py-2 px-3 text-[11px] text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Local Data & Reset</span>
        </button>
      </div>
    </div>
  );
};
