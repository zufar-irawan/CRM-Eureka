"use client";

import { Deal } from '../types';
import { Mail, Link2, Paperclip, ChevronDown } from 'lucide-react';

interface DealHeaderProps {
  deal: Deal;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  displayValue: (value: any, fallback?: string) => string;
}

export default function DealHeader({ deal, isDropdownOpen, setIsDropdownOpen, displayValue }: DealHeaderProps) {
  return (
    <div className="border-b border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
          <span>Deals</span>
          <span>/</span>
          <span className="text-gray-900">
            {displayValue(deal.title, deal.lead?.company || deal.company?.name || 'Untitled Deal')}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">CRM-DEAL-{deal.id}</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {displayValue(deal.title, deal.lead?.company || deal.company?.name || 'Untitled Deal')}
          </h1>
          <div className="flex items-center space-x-2">
            {(deal.lead?.email || deal.contact?.email || deal.company?.email) && (
              <a href={`mailto:${deal.lead?.email || deal.contact?.email || deal.company?.email}`}>
                <Mail className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </a>
            )}
            {(deal.lead?.company || deal.company?.name) && (
              <a 
                href={`https://${(deal.lead?.company || deal.company?.name)?.toLowerCase().replace(/\s+/g, '')}.com`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Link2 className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </a>
            )}
            <Paperclip className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700">
            <option>Assign to</option>
          </select>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 flex items-center space-x-2 hover:bg-gray-50"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>{displayValue(deal.stage, 'New')}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
