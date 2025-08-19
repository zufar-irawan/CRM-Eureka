"use client";

import { Mail, Link2, Paperclip, Edit } from 'lucide-react';
import type { Lead } from '../types';
import { STATUS_OPTIONS } from '../utils/constants';
import { displayValue, getFirstChar, safeString } from '../utils/formatting';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface LeadSidebarProps {
  lead: Lead | null;
  selectedStatus: string;
}

export default function LeadSidebar({ lead, selectedStatus }: LeadSidebarProps) {
  if (!lead) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const [owner, setOwner] = useState("")

  useEffect(() => {
    const ownerName = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/users/${lead.owner}`)

        setOwner(response.data.data.name)
      } catch (err) {
        console.log(err)
      }
    }

    if (lead?.owner) {
      ownerName()
    }
  }, [lead?.owner])

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6">
      {/* Header with avatar and action icons */}
      <div className="flex items-center justify-between mb-8">
        {/* Avatar circle with initial */}
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-600">
            {getFirstChar(lead.fullname)}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Mail className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Link2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Paperclip className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Details section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Details</h3>
          <button onClick={() => console.log('Edit details')}>
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Organization</span>
            <span className="text-sm text-gray-900 font-medium">
              {displayValue(lead.company)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Website</span>
            {lead.website ? (
              <a
                href={safeString(lead.website).startsWith('http')
                  ? safeString(lead.website)
                  : `https://${safeString(lead.website)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {displayValue(lead.website)}
              </a>
            ) : (
              <span className="text-sm text-gray-500">Not specified</span>
            )}
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-600 flex-shrink-0">Industry</span>
            <div className="text-right max-w-48">
              <span className="text-sm text-gray-900 font-medium break-words">
                {displayValue(lead.industry)}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Job Title</span>
            <span className="text-sm text-gray-900 font-medium">
              {displayValue(lead.job_position)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lead Owner</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-900 font-medium">
                {owner}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Stage</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${STATUS_OPTIONS.find(s => s.name === selectedStatus)?.color}`}></div>
              <span className="text-sm text-gray-900 font-medium">
                {selectedStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Person section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Person</h3>
          <button onClick={() => console.log('Edit person')}>
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">First Name</span>
            <span className="text-sm text-gray-900 font-medium">
              {displayValue(lead.first_name)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Last Name</span>
            <span className="text-sm text-gray-900 font-medium">
              {displayValue(lead.last_name)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Email</span>
            {lead.email ? (
              <a
                href={`mailto:${safeString(lead.email)}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {displayValue(lead.email)}
              </a>
            ) : (
              <span className="text-sm text-gray-500">Not specified</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Mobile No</span>
            <span className="text-sm text-gray-900 font-medium">
              {displayValue(lead.mobile)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}