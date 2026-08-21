import React from 'react';
import {
  LayoutTemplate,
  Maximize2,
  Type,
  Smile,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { TemplatesTab } from '../sidebar/TemplatesTab';
import { CanvasTab } from '../sidebar/CanvasTab';
import { TextLayersTab } from '../sidebar/TextLayersTab';
import { OverlayDecorationsTab } from '../sidebar/OverlayDecorationsTab';
import { StudioTabType } from '../../types/studio';

interface Props {
  onOpenJsonModal: () => void;
  onOpenExifModal: () => void;
}

interface TabItem {
  id: StudioTabType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC<Props> = ({
  onOpenJsonModal,
  onOpenExifModal,
}) => {
  const { activeTab, setActiveTab, template } = useStudio();

  // 4 Simple Tabs: Canvas, Text, Stickers, Templates
  const tabs: TabItem[] = [
    { id: 'canvas', label: 'Canvas', icon: Maximize2 },
    { id: 'text', label: 'Text', icon: Type, badge: template.textLayers.length },
    { id: 'decorations', label: 'Stickers', icon: Smile },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  ];

  return (
    <aside className="w-96 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-20 shadow-xs select-none">
      {/* Top Tab Switcher */}
      <div className="flex items-center p-2 gap-1 border-b border-slate-200 bg-slate-50/70">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition-all relative ${
                isActive
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4 mb-1" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scroll">
        {activeTab === 'canvas' && <CanvasTab onOpenExifModal={onOpenExifModal} />}
        {activeTab === 'text' && <TextLayersTab />}
        {activeTab === 'decorations' && <OverlayDecorationsTab />}
        {activeTab === 'templates' && <TemplatesTab onOpenJsonModal={onOpenJsonModal} />}
      </div>
    </aside>
  );
};
