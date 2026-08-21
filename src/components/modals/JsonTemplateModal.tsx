import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileCode,
  Download,
  Copy,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileJson,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { validateAndParseTemplateJSON } from '../../schema/templateSchema';
import { downloadBlob } from '../../core/canvas/exportEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const JsonTemplateModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    template,
    exportTemplatesToJSON,
    importTemplatesFromJSON,
  } = useStudio();

  const [jsonText, setJsonText] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const initialJson = JSON.stringify(template, null, 2);
      setJsonText(initialJson);
      validate(initialJson);
      setSuccessMsg(null);
    }
  }, [isOpen, template]);

  if (!isOpen) return null;

  const validate = (text: string) => {
    const res = validateAndParseTemplateJSON(text);
    setIsValid(res.success);
    setValidationErrors(res.errors);
    return res;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    setSuccessMsg(null);
    validate(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      const res = validate(content);
      if (res.success) {
        setSuccessMsg(`Successfully loaded ${file.name}! Click 'Apply & Import' below.`);
      }
    };
    reader.readAsText(file);
  };

  const handleApply = () => {
    const res = importTemplatesFromJSON(jsonText);
    if (res.success) {
      setSuccessMsg(`Successfully imported ${res.count} template(s)!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setValidationErrors(res.errors);
      setIsValid(false);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const filename = `${template.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_template.json`;
    downloadBlob(blob, filename);
  };

  const handleExportAllBackup = () => {
    const fullBackup = exportTemplatesToJSON();
    const blob = new Blob([fullBackup], { type: 'application/json' });
    downloadBlob(blob, `meme_studio_backup_${Date.now()}.json`);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonText);
    setSuccessMsg('JSON copied to clipboard!');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <FileCode className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-800">
              Template JSON Config (Import / Export)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                Upload .json
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                Copy JSON
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Download Current
              </button>

              <button
                onClick={handleExportAllBackup}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <FileJson className="w-3.5 h-3.5 text-emerald-600" />
                Export Full Backup
              </button>
            </div>
          </div>

          {/* JSON Textarea Editor */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
              <span>Schema Payload (Zod Validated)</span>
              {isValid ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Valid Schema
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Schema Validation Errors ({validationErrors.length})
                </span>
              )}
            </label>
            <textarea
              rows={12}
              value={jsonText}
              onChange={handleTextChange}
              className={`w-full bg-slate-50 font-mono text-[11px] p-3 rounded-xl border focus:outline-none custom-scroll ${
                isValid
                  ? 'border-slate-300 text-slate-800 focus:border-emerald-500 focus:bg-white'
                  : 'border-red-400 text-red-700 focus:border-red-500 bg-red-50/50'
              }`}
            />
          </div>

          {/* Validation Error Box */}
          {!isValid && validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1.5">
              <div className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Schema Diagnostics (Existing storage is protected):
              </div>
              <ul className="space-y-1 max-h-28 overflow-y-auto text-[11px] font-mono text-red-700">
                {validationErrors.map((err, i) => (
                  <li key={i} className="bg-red-100/70 p-1 rounded">
                    • {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-semibold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!isValid}
            className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            Apply & Import Template
          </button>
        </div>
      </div>
    </div>
  );
};
