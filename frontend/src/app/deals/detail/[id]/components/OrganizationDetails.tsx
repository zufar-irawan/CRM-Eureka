"use client";

import { Deal } from '../types';
import { Edit, ChevronDown } from 'lucide-react';

interface OrganizationDetailsProps {
  deal: Deal;
  isOrgDetailsExpanded: boolean;
  setIsOrgDetailsExpanded: (expanded: boolean) => void;
  displayValue: (value: any, fallback?: string) => string;
  formatCurrency: (value: any) => string;
  formatDate: (dateString: string | null | undefined) => string;
}

export default function OrganizationDetails({ 
  deal, 
  isOrgDetailsExpanded, 
  setIsOrgDetailsExpanded, 
  displayValue, 
  formatCurrency, 
  formatDate 
}: OrganizationDetailsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <button
            onClick={() => setIsOrgDetailsExpanded(!isOrgDetailsExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOrgDetailsExpanded ? '' : '-rotate-90'}`} />
          </button>
          Organization Details
        </h3>
        <button onClick={() => console.log('Edit organization')}>
          <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      {isOrgDetailsExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <span className="text-sm text-gray-600 col-span-1">Organization</span>
            <span className="text-sm text-gray-900 font-medium col-span-2">
              {displayValue(
                deal.company?.name || deal.lead?.company, 
                'Not specified'
              )}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 items-center">
            <span className="text-sm text-gray-600 col-span-1">Primary Contact</span>
            <span className="text-sm text-gray-900 font-medium col-span-2">
              {displayValue(
                deal.contact?.name || deal.lead?.fullname, 
                'Not specified'
              )}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 items-center">
            <span className="text-sm text-gray-600 col-span-1">Email</span>
            <span className="text-sm text-gray-900 font-medium col-span-2">
              {(deal.contact?.email || deal.lead?.email || deal.company?.email) ? (
                <a 
                  href={`mailto:${deal.contact?.email || deal.lead?.email || deal.company?.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {deal.contact?.email || deal.lead?.email || deal.company?.email}
                </a>
              ) : (
                'Not specified'
              )}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 items-center">
            <span className="text-sm text-gray-600 col-span-1">Phone</span>
            <span className="text-sm text-gray-900 font-medium col-span-2">
              {(deal.contact?.phone || deal.lead?.phone || deal.company?.phone) ? (
                <a 
                  href={`tel:${deal.contact?.phone || deal.lead?.phone || deal.company?.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {deal.contact?.phone || deal.lead?.phone || deal.company?.phone}
                </a>
              ) : (
                'Not specified'
              )}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 items-center">
            <span className="text-sm text-gray-600 col-span-1">Address</span>
            <span className="text-sm text-gray-900 font-medium col-span-2">
              {displayValue(deal.company?.address, 'Not specified')}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 items-center">
            <span className="text-sm text-gray-600 col-span-1">Industry</span>
            <span className="text-sm text-gray-900 font-medium col-span-2">
              {displayValue(deal.lead?.industry, 'Not specified')}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 items-center">
            <span className="text-sm text-gray-600 col-span-1">Deal Owner</span>
            <span className="text-sm text-gray-900 font-medium col-span-2">
              {displayValue(deal.creator?.name, 'Not assigned')}
            </span>
          </div>

          {/* Deal Value and Stage */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 items-center mb-3">
              <span className="text-sm text-gray-600 col-span-1">Deal Value</span>
              <span className="text-sm text-gray-900 font-medium col-span-2">
                {formatCurrency(deal.value)}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 items-center mb-3">
              <span className="text-sm text-gray-600 col-span-1">Stage</span>
              <span className="text-sm text-gray-900 font-medium col-span-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {displayValue(deal.stage, 'New')}
                </span>
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-sm text-gray-600 col-span-1">Created</span>
              <span className="text-sm text-gray-900 font-medium col-span-2">
                {formatDate(deal.created_at)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}