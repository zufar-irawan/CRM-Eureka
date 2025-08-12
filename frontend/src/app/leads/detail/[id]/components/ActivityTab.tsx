"use client";

import { User, Zap, CheckCircle, Plus, BarChart3, Edit, RefreshCw } from 'lucide-react';

interface ActivityTabProps {
  lead: any;
}

const ActivityTab = ({ lead }: ActivityTabProps) => {
  const displayValue = (value: any, fallback: string = 'Unknown'): string => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  };

  const formatTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const mapStageToDisplayName = (stage: string): string => {
    const stageMap: { [key: string]: string } = {
      'new': 'New',
      'contacted': 'Contacted',
      'qualified': 'Qualified',
      'proposal': 'Proposal',
      'negotiation': 'Negotiation',
      'won': 'Won',
      'lost': 'Lost'
    };
    return stageMap[stage] || stage;
  };

  if (!lead) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Activity</h2>
        </div>
        <div className="text-center py-16">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No lead data available</p>
        </div>
      </div>
    );
  }

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
        {/* Lead Creation Activity */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{displayValue(lead.creator?.name, 'System')}</span> created this lead
            </p>
            <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(lead.created_at)}</p>
          </div>
        </div>

        {/* Stage Change Activity (if lead has been updated) */}
        {lead.updated_at && lead.updated_at !== lead.created_at && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{displayValue(lead.updated_by?.name, 'System')}</span> updated lead stage to {mapStageToDisplayName(displayValue(lead.stage, 'New'))}
              </p>
              <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(lead.updated_at)}</p>
            </div>
          </div>
        )}

        {/* Lead Information Update (if significant fields are present) */}
        {(lead.email || lead.phone || lead.company) && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
              <Edit className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">System</span> added contact information
              </p>
              <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2 space-y-1">
                {lead.email && <div>Email: {lead.email}</div>}
                {lead.phone && <div>Phone: {lead.phone}</div>}
                {lead.company && <div>Company: {lead.company}</div>}
              </div>
              <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(lead.created_at)}</p>
            </div>
          </div>
        )}

        {/* Lead Conversion Activity (if lead is converted) */}
        {lead.status === true && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{displayValue(lead.converted_by?.name, 'System')}</span> converted this lead to a deal
              </p>
              <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(lead.converted_at || lead.updated_at)}</p>
            </div>
          </div>
        )}

        {/* Lead Source Activity (if source is specified) */}
        {lead.source && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">System</span> set lead source to "{displayValue(lead.source)}"
              </p>
              <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(lead.created_at)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty State (if no activities) */}
      {(!lead.created_at && !lead.updated_at) && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Activity for {displayValue(lead.fullname, 'this lead')}
          </h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Create Activity
          </button>
        </div>
      )}
    </div>
  );
};

export { ActivityTab };