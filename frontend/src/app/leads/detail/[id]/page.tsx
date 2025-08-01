"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ConvertToDealModal from "../../components/ConvertToDealModal";

import {
  Mail,
  Link2,
  Paperclip,
  BarChart3,
  CheckSquare,
  Phone,
  ChevronDown,
  Plus,
  FileText,
  Edit,
  MessageSquare,
  Database,
  StickyNote
} from "lucide-react";

interface Lead {
  id: string | number;
  title?: string | null;
  fullname?: string | null;
  company?: string | null;
  email?: string | null;
  mobile?: string | null;
  industry?: string | null;
  job_position?: string | null;
  website?: string | null;
  owner?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  stage?: string | null;
  updated_at?: string | null;
  status?: boolean;
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("New");
  const [activeTab, setActiveTab] = useState("Notes");
  const [isMinimized, setIsMinimized] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // Modal state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Utility functions
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  const getFirstChar = (value: any, fallback: string = ''): string => {
    const str = safeString(value);
    return str.length > 0 ? str.charAt(0).toUpperCase() : fallback;
  };

  const displayValue = (value: any, fallback: string = 'Not specified'): string => {
    const str = safeString(value);
    return str.length > 0 ? str : fallback;
  };

  const statusOptions = [
    { name: "New", color: "bg-gray-500", backendStage: "New" },
    { name: "Contacted", color: "bg-orange-500", backendStage: "Contacted" },
    { name: "Qualification", color: "bg-green-500", backendStage: "Qualification" },
    { name: "Unqualified", color: "bg-red-500", backendStage: "Unqualified" },
    { name: "Converted", color: "bg-purple-500", backendStage: "Converted" }
  ];

  const tabs = [
    { name: "Activity", icon: BarChart3 },
    { name: "Emails", icon: Mail },
    { name: "Comments", icon: MessageSquare },
    { name: "Data", icon: Database },
    { name: "Calls", icon: Phone },
    { name: "Tasks", icon: CheckSquare },
    { name: "Notes", icon: StickyNote },
    { name: "Attachments", icon: Paperclip }
  ];

  // Function to map backend stage to frontend status
  const mapStageToStatus = (stage: string): string => {
    const stageMap: { [key: string]: string } = {
      'New': 'New',
      'Contacted': 'Contacted',
      'Qualification': 'Qualification',
      'Unqualified': 'Unqualified',
      'Converted': 'Converted'
    };
    return stageMap[stage] || 'New';
  };

  // Function to fetch lead data
  const fetchLead = async () => {
    if (!id) {
      setError("Invalid lead ID");
      return;
    }

    try {
      setError(null);

      console.log(`[DEBUG] Fetching lead with ID: ${id}`);

      const response = await fetch(`http://localhost:5000/api/leads/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      console.log(`[DEBUG] Response:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Lead with ID ${id} not found`);
        }

        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('[DEBUG] Successfully received data:', data);

      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data format received from server");
      }

      setLead(data);

      if (data.stage) {
        setSelectedStatus(mapStageToStatus(data.stage));
      }

    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred';

      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check if backend server is running on localhost:5000';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      console.error('[ERROR] Fetch failed:', err);
      setError(errorMessage);

      if (err instanceof Error && err.message.includes('not found')) {
        setTimeout(() => router.push('/leads'), 3000);
      }
    }
  };

  const updateLeadStage = async (newStatus: string) => {
    if (!lead) return;

    const statusOption = statusOptions.find(s => s.name === newStatus);
    if (!statusOption) return;

    if (newStatus === "Converted") {
      alert("To convert a lead, please use the 'Convert to Deal' button instead.");
      return;
    }

    if (lead.status === true) {
      alert("Cannot update stage of converted lead.");
      return;
    }

    setIsUpdatingStage(true);

    try {
      console.log('[DEBUG] Updating lead stage:', {
        leadId: lead.id,
        currentStage: lead.stage,
        newStage: statusOption.backendStage
      });

      const response = await fetch(`http://localhost:5000/api/leads/${lead.id}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: statusOption.backendStage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[DEBUG] Stage update successful:', result);

      setLead(prevLead => prevLead ? {
        ...prevLead,
        stage: statusOption.backendStage,
        updated_at: new Date().toISOString()
      } : null);

      setSelectedStatus(newStatus);

      alert(`Lead stage updated to "${newStatus}" successfully!`);

    } catch (error: unknown) {
      console.error('[ERROR] Failed to update lead stage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update lead stage';
      alert(`Error: ${errorMessage}`);

      if (lead?.stage) {
        setSelectedStatus(mapStageToStatus(lead.stage));
      }
    } finally {
      setIsUpdatingStage(false);
      setIsDropdownOpen(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === selectedStatus) {
      setIsDropdownOpen(false);
      return;
    }

    await updateLeadStage(newStatus);
  };

  // UPDATED: Modified function to handle conversion and refresh data
  const handleConvertToDeal = async (leadId: string, dealTitle: string, dealValue: number, dealStage: string) => {
    if (!lead) {
      console.error('[ERROR] No lead data available for conversion');
      throw new Error('No lead data available');
    }

    console.log('[DEBUG] Converting lead to deal:', {
      leadId,
      dealTitle,
      dealValue,
      dealValueType: typeof dealValue,
      dealStage
    });

    const requestBody = {
      dealTitle: dealTitle.trim(),
      dealValue: parseFloat(dealValue.toString()),
      dealStage: dealStage,
      leadData: {
        fullname: lead.fullname,
        company: lead.company,
        email: lead.email,
        mobile: lead.mobile,
        industry: lead.industry,
        job_position: lead.job_position,
        website: lead.website
      }
    };

    console.log('[DEBUG] Request body being sent:', requestBody);

    const response = await fetch(`http://localhost:5000/api/leads/${leadId}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[DEBUG] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[DEBUG] Error response:', errorData);
      throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[DEBUG] Conversion successful:', result);

    // Return the result for the modal to process
    return result;
  };

  // UPDATED: Handle modal close with data refresh
  const handleModalClose = async () => {
    setShowConvertModal(false);
    
    // Refresh lead data after conversion
    await fetchLead();
    
    console.log('[DEBUG] Lead data refreshed after conversion');
  };

  useEffect(() => {
    fetchLead();
  }, [id, router]);

  const renderTabContent = () => {
    if (!lead) return null;

    switch (activeTab) {
      case "Activity":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Activity</h2>
              <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
                <Plus className="w-4 h-4" />
                <span>New Activity</span>
              </button>
            </div>
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
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">
              {activeTab} content for {displayValue(lead.fullname, 'this lead')}
            </h3>
          </div>
        );
    }
  };

  const currentLead = lead || {
    id: id || '',
    title: '',
    fullname: '',
    company: '',
    email: '',
    mobile: '',
    industry: '',
    job_position: '',
    website: '',
    owner: '',
    first_name: '',
    last_name: '',
    stage: 'New',
    updated_at: new Date().toISOString(),
    status: false
  };

  const availableStatusOptions = currentLead.status === true
    ? statusOptions.filter(option => option.name === 'Converted')
    : statusOptions.filter(option => option.name !== 'Converted');

  return (
    <main className="p-4 overflow-auto lg:p-6 bg-white">
      <div className={`flex-1 flex`}>
        {/* Main content area */}
        <div className="flex-1 bg-white">
          {/* Header section */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2 text-gray-600 text-sm">
                <span>Leads</span>
                <span>/</span>
                <span className="text-gray-900">
                  {displayValue(currentLead.title)} {displayValue(currentLead.fullname)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">CRM-LEAD-{currentLead.id}</div>
                {currentLead.status === true && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    Converted
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {displayValue(currentLead.title)} {displayValue(currentLead.fullname)}
                </h1>
                <div className="flex items-center space-x-2">
                  {safeString(currentLead.email) && (
                    <a href={`mailto:${safeString(currentLead.email)}`}>
                      <Mail className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </a>
                  )}
                  {safeString(currentLead.website) && (
                    <a
                      href={safeString(currentLead.website).startsWith('http') ? safeString(currentLead.website) : `https://${safeString(currentLead.website)}`}
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
                        <div className={`w-2 h-2 rounded-full ${statusOptions.find(s => s.name === selectedStatus)?.color}`}></div>
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
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${status.name === selectedStatus ? 'bg-gray-50 font-medium' : ''
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
                <button
                  onClick={() => setShowConvertModal(true)}
                  disabled={isConverting || !lead || currentLead.status === true}
                  className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isConverting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Converting...</span>
                    </>
                  ) : currentLead.status === true ? (
                    <span>Already Converted</span>
                  ) : (
                    <span>Convert to Deal</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-0 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab.name === activeTab
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

          {/* Tab content */}
          {renderTabContent()}
        </div>

        {/* Right sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-700">
                {getFirstChar(currentLead.fullname) || getFirstChar(currentLead.company) || 'L'}
              </span>
            </div>
            <div className="flex space-x-2">
              {safeString(currentLead.email) && (
                <a href={`mailto:${safeString(currentLead.email)}`}>
                  <Mail className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </a>
              )}
              {safeString(currentLead.website) && (
                <a
                  href={safeString(currentLead.website).startsWith('http') ? safeString(currentLead.website) : `https://${safeString(currentLead.website)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Link2 className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </a>
              )}
              <Paperclip className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </div>
          </div>

          {/* Details section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Details</h3>
              <button onClick={() => console.log('Edit details')}>
                <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Organization</span>
                <span className="text-sm text-gray-900 font-medium">
                  {displayValue(currentLead.company)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Website</span>
                {safeString(currentLead.website) ? (
                  <a
                    href={safeString(currentLead.website).startsWith('http') ? safeString(currentLead.website) : `https://${safeString(currentLead.website)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {safeString(currentLead.website)}
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">Not specified</span>
                )}
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600 flex-shrink-0">Industry</span>
                <div className="text-right max-w-48">
                  <span className="text-sm text-gray-900 font-medium break-words">
                    {displayValue(currentLead.industry)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Job Title</span>
                <span className="text-sm text-gray-900 font-medium">
                  {displayValue(currentLead.job_position)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lead Owner</span>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                    {getFirstChar(currentLead.owner, 'A')}
                  </span>
                  <span className="text-sm text-gray-900 font-medium">
                    {displayValue(currentLead.owner, 'Administrator')}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Stage</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${statusOptions.find(s => s.name === selectedStatus)?.color}`}></div>
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
              <h3 className="text-sm font-semibold text-gray-900">Person</h3>
              <button onClick={() => console.log('Edit person')}>
                <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Salutation</span>
                <span className="text-sm text-gray-900 font-medium">
                  {displayValue(currentLead.title)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">First Name</span>
                <span className="text-sm text-gray-900 font-medium">
                  {displayValue(currentLead.first_name)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Name</span>
                <span className="text-sm text-gray-900 font-medium">
                  {displayValue(currentLead.last_name)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Email</span>
                {safeString(currentLead.email) ? (
                  <a
                    href={`mailto:${safeString(currentLead.email)}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {safeString(currentLead.email)}
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">Not specified</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mobile No</span>
                <span className="text-sm text-gray-900 font-medium">
                  {displayValue(currentLead.mobile)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConvertModal && lead && (
        <ConvertToDealModal
          onClose={handleModalClose}
          onConfirm={handleConvertToDeal}
          selectedCount={1}
          selectedIds={[String(lead.id)]}
        />
      )}
    </main>
  );
}