"use client";

import { BarChart3, Mail, MessageSquare, Database, Phone, CheckSquare, StickyNote } from 'lucide-react';

interface Tab {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs: Tab[] = [
  { name: "Activity", icon: BarChart3 },
  { name: "Emails", icon: Mail, disabled: true },
  { name: "Comments", icon: MessageSquare, },
  { name: "Data", icon: Database, disabled: true },
  { name: "Calls", icon: Phone, disabled: true },
  { name: "Tasks", icon: CheckSquare },
  { name: "Notes", icon: StickyNote, disabled: true },  
];

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-0 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => !tab.disabled && setActiveTab(tab.name)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab.name === activeTab
                ? "border-gray-900 text-gray-900"
                : tab.disabled
                ? "border-transparent text-red-500 hover:text-red-700 cursor-not-allowed"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            disabled={tab.disabled}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}