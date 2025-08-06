"use client";

import { TABS } from '../utils/constants';

interface LeadTabsProps {
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

export default function LeadTabs({ activeTab, onTabChange }: LeadTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-0 px-6">
        {TABS.map((tab) => (
          <button
            key={tab.name}
            onClick={() => onTabChange(tab.name)}
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