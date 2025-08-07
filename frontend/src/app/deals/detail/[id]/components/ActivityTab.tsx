"use client";

import { Deal } from '../types';
import { User, Zap, CheckCircle, Plus, BarChart3 } from 'lucide-react';

interface ActivityTabProps {
  deal: Deal;
  displayValue: (value: any, fallback?: string) => string;
  formatTimeAgo: (dateString: string | null | undefined) => string;
  formatCurrency: (value: any) => string;
}

export default function ActivityTab({ deal, displayValue, formatTimeAgo, formatCurrency }: ActivityTabProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Activity</h2>
        <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
          <Plus className="w-4 h-4" />
          <span>New Activity</span>
        </button>
      </div>

      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{displayValue(deal.creator?.name, 'Unknown')}</span> created this deal
            </p>
            <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(deal.created_at)}</p>
          </div>
        </div>

        {deal.updated_at && deal.updated_at !== deal.created_at && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{displayValue(deal.creator?.name, 'Unknown')}</span> updated deal stage to {displayValue(deal.stage, 'Unknown')}
              </p>
              <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(deal.updated_at)}</p>
            </div>
          </div>
        )}

        {deal.value && deal.value > 0 && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">System</span> set deal value to {formatCurrency(deal.value)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(deal.created_at)}</p>
            </div>
          </div>
        )}
      </div>

      {(!deal.created_at && !deal.updated_at) && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Activity for {displayValue(deal.title, 'this deal')}
          </h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Create Activity
          </button>
        </div>
      )}
    </div>
  );
}