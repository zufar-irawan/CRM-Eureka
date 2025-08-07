"use client";

import { BarChart3, Mail, MessageSquare, Database, Phone, CheckSquare, StickyNote, Paperclip } from 'lucide-react';

interface Tab {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs: Tab[] = [
  { name: "Activity", icon: BarChart3 },
  { name: "Emails", icon: Mail },
  { name: "Comments", icon: MessageSquare },
  { name: "Data", icon: Database },
  { name: "Calls", icon: Phone },
  { name: "Tasks", icon: CheckSquare },
  { name: "Notes", icon: StickyNote },
  { name: "Attachments", icon: Paperclip }
];

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-0 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab.name === activeTab
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}