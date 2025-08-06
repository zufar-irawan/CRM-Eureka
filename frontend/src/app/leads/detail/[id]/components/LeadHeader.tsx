"use client";

import { useState } from 'react';
import { Mail, Link2, Paperclip, ChevronDown } from 'lucide-react';
import type { Lead, StatusOption } from '../types';
import { STATUS_OPTIONS } from '../utils/constants';
import { displayValue, safeString } from '../utils/formatting';

interface LeadHeaderProps {
  lead: Lead | null;
  selectedStatus: string;
  isUpdatingStage: boolean;
  isConverting: boolean;
  onStatusChange: (newStatus: string) => Promise<void>;
  onConvertToDeal: () => void;
}

export default function LeadHeader({
  lead,
  selectedStatus,
  isUpdatingStage,
  isConverting,
  onStatusChange,
  onConvertToDeal
}: LeadHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!lead) {
    return (
      <div className="border-b border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const availableStatusOptions = lead.status === true
    ? STATUS_OPTIONS.filter(option => option.name === 'Converted')
    : STATUS_OPTIONS.filter(option => option.name !== 'Converted');

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === selectedStatus) {
      setIsDropdownOpen(false);
      return;
    }
    
    await onStatusChange(newStatus);
    setIsDropdownOpen(false);
  };

  return (
    <div className="border-b border-gray-200 p-6">
      {/* Breadcrumb */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
          <span>Leads</span>
          <span>/</span>
          <span className="text-gray-900">
            {displayValue(lead.title)} {displayValue(lead.fullname)}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">CRM-LEAD-{lead.id}</div>
          {lead.status === true && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              Converted
            </span>
          )}
        </div>
      </div>

      {/* Header Content */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {displayValue(lead.title)} {displayValue(lead.fullname)}
          </h1>
          <div className="flex items-center space-x-2">
            {safeString(lead.email) && (
              <a href={`mailto:${safeString(lead.email)}`}>
                <Mail className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </a>
            )}
            {safeString(lead.website) && (
              <a
                href={safeString(lead.website).startsWith('http') 
                  ? safeString(lead.website) 
                  : `https://${safeString(lead.website)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Link2 className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </a>
            )}
            <Paperclip className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700">
            <option>Assign to</option>
          </select>
          
          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => !isUpdatingStage && setIsDropdownOpen(!isDropdownOpen)}
              disabled={isUpdatingStage}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 flex items-center space-x-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingStage ? (
                <>
                  <div className="w-2 h-2 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <div className={`w-2 h-2 rounded-full ${STATUS_OPTIONS.find(s => s.name === selectedStatus)?.color}`}></div>
                  <span>{selectedStatus}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </>
              )}
            </button>

            {isDropdownOpen && !isUpdatingStage && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  {availableStatusOptions.map((status) => (
                    <button
                      key={status.name}
                      onClick={() => handleStatusChange(status.name)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${
                        status.name === selectedStatus ? 'bg-gray-50 font-medium' : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                      <span>{status.name}</span>
                      {status.name === selectedStatus && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Convert to Deal Button */}
          <button
            onClick={onConvertToDeal}
            disabled={isConverting || !lead || lead.status === true}
            className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isConverting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Converting...</span>
              </>
            ) : lead.status === true ? (
              <span>Already Converted</span>
            ) : (
              <span>Convert to Deal</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}