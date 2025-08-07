"use client";

import { Deal } from '../types';
import { Mail, Plus } from 'lucide-react';

interface EmailsTabProps {
  deal: Deal;
  displayValue: (value: any, fallback?: string) => string;
}

export default function EmailsTab({ deal, displayValue }: EmailsTabProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Emails</h2>
        <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
          <Plus className="w-4 h-4" />
          <span>Compose</span>
        </button>
      </div>
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
          <Mail className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Emails for {displayValue(deal.title, 'this deal')}
        </h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Send Email
        </button>
      </div>
    </div>
  );
}