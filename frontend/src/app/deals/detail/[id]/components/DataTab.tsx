"use client";

import { Deal } from '../types';
import { Edit } from 'lucide-react';

interface DataTabProps {
  deal: Deal;
  displayValue: (value: any, fallback?: string) => string;
  formatCurrency: (value: any) => string;
  formatPercentage: (value: any) => string;
  formatDate: (dateString: string | null | undefined) => string;
}

export default function DataTab({ deal, displayValue, formatCurrency, formatPercentage, formatDate }: DataTabProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Deal Data</h2>
        <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </div>
      <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Deal Value</label>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(deal.value)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Probability</label>
            <p className="text-2xl font-bold text-gray-900">{formatPercentage(deal.probability || 0)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Created Date</label>
            <p className="text-base text-gray-600">{formatDate(deal.created_at)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Last Updated</label>
            <p className="text-base text-gray-600">{formatDate(deal.updated_at)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Stage</label>
            <p className="text-base text-gray-600">{displayValue(deal.stage)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Deal Owner</label>
            <p className="text-base text-gray-600">{displayValue(deal.creator?.name)}</p>
          </div>
        </div>
        
        {deal.description && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
            <p className="text-gray-700 leading-relaxed">{deal.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
