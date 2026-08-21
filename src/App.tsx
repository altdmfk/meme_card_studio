import React, { useState } from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { StudioCanvas } from './components/canvas/StudioCanvas';
import { ExportModal } from './components/modals/ExportModal';
import { JsonTemplateModal } from './components/modals/JsonTemplateModal';
import { ExifInspectorModal } from './components/modals/ExifInspectorModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ShieldCheck, X } from 'lucide-react';

const StudioMain: React.FC = () => {
  useKeyboardShortcuts();

  const { lastExifReport, clearExifReport } = useStudio();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [isExifOpen, setIsExifOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 text-slate-800 overflow-hidden font-sans select-none">
      {/* Top Navigation */}
      <Navbar
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenJsonModal={() => setIsJsonOpen(true)}
      />

      {/* Main Studio Workspace: Sidebar + Viewport Canvas */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden relative">
        <Sidebar
          onOpenJsonModal={() => setIsJsonOpen(true)}
          onOpenExifModal={() => setIsExifOpen(true)}
        />
        <StudioCanvas />
      </div>

      {/* EXIF Stripped Notification Toast */}
      {lastExifReport && (
        <div className="absolute top-16 right-6 z-40 bg-white border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Image Sanitized!</span> EXIF, GPS & Camera Metadata Purged.
          </div>
          <button
            onClick={() => setIsExifOpen(true)}
            className="text-[11px] underline font-semibold text-emerald-700 hover:text-emerald-900 ml-1"
          >
            Details
          </button>
          <button
            onClick={clearExifReport}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modals */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <JsonTemplateModal isOpen={isJsonOpen} onClose={() => setIsJsonOpen(false)} />
      <ExifInspectorModal isOpen={isExifOpen} onClose={() => setIsExifOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <StudioProvider>
        <StudioMain />
      </StudioProvider>
    </ErrorBoundary>
  );
}

export default App;
