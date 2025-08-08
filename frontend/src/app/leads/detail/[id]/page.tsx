"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useLead } from "./hooks/useLead";
import LeadHeader from "./components/LeadHeader";
import LeadTabs from "./components/LeadTabs";
import LeadSidebar from "./components/LeadSidebar";
import CommentsTab from "./components/Comments/CommentTab";
import TasksTab from "./components/Tasks/TasksTab";
import ConvertToDealModal from "../../components/ConvertToDealModal";
import { makeAuthenticatedRequest } from "./utils/auth";
import { API_ENDPOINTS } from "./utils/constants";
import Swal from "sweetalert2";

// Tab Components
const ActivityTab = ({ lead }: { lead: any }) => (
  <div className="p-6">
    <h3 className="text-lg font-medium text-gray-900">
      Activity content for {lead?.fullname || 'this lead'}
    </h3>
  </div>
);

const EmailsTab = ({ lead }: { lead: any }) => (
  <div className="p-6">
    <h3 className="text-lg font-medium text-gray-900">
      Emails content for {lead?.fullname || 'this lead'}
    </h3>
  </div>
);

const DataTab = ({ lead }: { lead: any }) => (
  <div className="p-6">
    <h3 className="text-lg font-medium text-gray-900">
      Data content for {lead?.fullname || 'this lead'}
    </h3>
  </div>
);

const CallsTab = ({ lead }: { lead: any }) => (
  <div className="p-6">
    <h3 className="text-lg font-medium text-gray-900">
      Calls content for {lead?.fullname || 'this lead'}
    </h3>
  </div>
);

const NotesTab = ({ lead }: { lead: any }) => (
  <div className="p-6">
    <h3 className="text-lg font-medium text-gray-900">
      Notes content for {lead?.fullname || 'this lead'}
    </h3>
  </div>
);

const AttachmentsTab = ({ lead }: { lead: any }) => (
  <div className="p-6">
    <h3 className="text-lg font-medium text-gray-900">
      Attachments content for {lead?.fullname || 'this lead'}
    </h3>
  </div>
);

export default function LeadDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Notes");
  const [selectedStatus, setSelectedStatus] = useState("New");
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const { currentUser, userLoading } = useAuth();
  const { lead, error, fetchLead, refreshLead, mapStageToStatus, setLead } = useLead(id);

  useEffect(() => {
    if (!userLoading) {
      fetchLead();
    }
  }, [id, userLoading]);

  useEffect(() => {
    if (lead?.stage) {
      setSelectedStatus(mapStageToStatus(lead.stage));
    }
  }, [lead, mapStageToStatus]);

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;

    if (newStatus === "Converted") {
      Swal.fire({
        icon: 'info',
        title: 'Information',
        text: "To convert a lead, please use the 'Convert to Deal' button instead."
      })
      return;
    }

    if (lead.status === true) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: "Cannot update stage of converted lead."
      })
      return;
    }

    setIsUpdatingStage(true);

    try {
      const statusOption = require('./utils/constants').STATUS_OPTIONS.find((s: any) => s.name === newStatus);
      if (!statusOption) return;

      const response = await makeAuthenticatedRequest(`${API_ENDPOINTS.LEADS}/${lead.id}/stage`, {
        method: 'PUT',
        body: JSON.stringify({
          stage: statusOption.backendStage
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setLead(prevLead => prevLead ? {
        ...prevLead,
        stage: statusOption.backendStage,
        updated_at: new Date().toISOString()
      } : null);

      setSelectedStatus(newStatus);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Lead stage updated to "${newStatus}" successfully!`
      })

    } catch (error: unknown) {
      console.error('[ERROR] Failed to update lead stage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update lead stage';

      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: `Error: ${errorMessage}`
      })

      if (lead?.stage) {
        setSelectedStatus(mapStageToStatus(lead.stage));
      }
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleConvertToDeal = async (leadId: string, dealTitle: string, dealValue: number, dealStage: string) => {
    if (!lead) throw new Error('No lead data available');

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

    const response = await makeAuthenticatedRequest(`${API_ENDPOINTS.LEADS}/${leadId}/convert`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  const renderTabContent = () => {
    if (!lead) return null;

    switch (activeTab) {
      case "Comments":
        return <CommentsTab leadId={id} currentUser={currentUser} />;
      case "Tasks":
        return <TasksTab currentUser={currentUser} />; // ✅ Updated: leadId tidak perlu dikirim manual
      case "Activity":
        return <ActivityTab lead={lead} />;
      case "Emails":
        return <EmailsTab lead={lead} />;
      case "Data":
        return <DataTab lead={lead} />;
      case "Calls":
        return <CallsTab lead={lead} />;
      case "Notes":
        return <NotesTab lead={lead} />;
      case "Attachments":
        return <AttachmentsTab lead={lead} />;
      default:
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">
              {activeTab} content for {lead.fullname || 'this lead'}
            </h3>
          </div>
        );
    }
  };

  if (userLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchLead}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      <div className="flex-1 bg-white">
        <LeadHeader
          lead={lead}
          selectedStatus={selectedStatus}
          isUpdatingStage={isUpdatingStage}
          isConverting={isConverting}
          onStatusChange={handleStatusChange}
          onConvertToDeal={() => setShowConvertModal(true)}
        />

        <LeadTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {renderTabContent()}
      </div>

      <LeadSidebar
        lead={lead}
        selectedStatus={selectedStatus}
      />

      {showConvertModal && lead && (
        <ConvertToDealModal
          onClose={async () => {
            setShowConvertModal(false);
            await refreshLead();
          }}
          onConfirm={handleConvertToDeal}
          selectedCount={1}
          selectedIds={[String(lead.id)]}
        />
      )}
    </div>
  );
}
