"use client";

import { MessageSquare } from 'lucide-react';

interface Tab {
  label: string;   // nama yang ditampilkan
  value: string;   // nama state sebenarnya
  icon: React.ComponentType<{ className?: string }>;
}

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs: Tab[] = [
  { label: "Activity", value: "Comments", icon: MessageSquare }, 
  // tampil "Activity", tapi nilai sebenarnya "Comments"
];

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-0 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab.value === activeTab
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
