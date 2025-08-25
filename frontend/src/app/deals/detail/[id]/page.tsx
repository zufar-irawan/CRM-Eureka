"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { AlertCircle } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import DealHeader from "./components/DealHeader";
import TabNavigation from "./components/TabNavigation";
import TabContent from "./components/TabContent";
import RightSidebar from "./components/RightSidebar";
import DealCommentTab from "./components/Comments/DealCommentTab";
import { useAuth } from "../[id]/hooks/useAuth";
import { makeAuthenticatedRequest } from "../[id]/utils/auth";
import { Deal, Contact, Comment, Company } from "./types";
import Swal from "sweetalert2";
import { checkAuthStatus } from "../../../../../utils/auth";

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          Swal.fire({
            icon: "info",
            title: "You're not logged in",
            text: "Make sure to login first!"
          });
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);
  const { currentUser, userLoading } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Activity");
  const [deal, setDeal] = useState<Deal | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [isContactsExpanded, setIsContactsExpanded] = useState(true);
  const [isOrgDetailsExpanded, setIsOrgDetailsExpanded] = useState(true);

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return "";
    return String(value);
  };

  const getFirstChar = (value: any, fallback: string = ""): string => {
    const str = safeString(value);
    return str.length > 0 ? str.charAt(0).toUpperCase() : fallback;
  };

  const displayValue = (
    value: any,
    fallback: string = "Not specified"
  ): string => {
    const str = safeString(value);
    return str.length > 0 ? str : fallback;
  };

  const formatCurrency = (value: any): string => {
    const num = parseFloat(String(value || 0));
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (value: any): string => {
    const num = parseFloat(String(value || 0));
    return `${num.toFixed(0)}%`;
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;

    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const handleDealUpdate = useCallback((updatedDeal: Deal) => {
    const prevOwner = deal?.owner;
    setDeal(updatedDeal);
    console.log("Deal updated in parent:", updatedDeal);

    // If owner was updated, log the change
    if (updatedDeal.owner !== prevOwner) {
      console.log(`Deal ownership changed from ${prevOwner || 'unassigned'} to ${updatedDeal.owner || 'unassigned'}`);
    }
  }, [deal?.owner]);

  const fetchDeal = async () => {
    if (!id) {
      setError("Invalid deal ID");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log(`[DEBUG] Fetching deal with ID: ${id}`);

      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/deals/${id}`
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          throw new Error(`Deal with ID ${id} not found`);
        }
        const errorData = await response.json().catch(() => null);
        const errorMsg =
          errorData?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const responseData = await response.json();

      const dealData = responseData.data || responseData;

      if (!dealData || typeof dealData !== "object") {
        throw new Error("Invalid data format received from server");
      }

      console.log("[DEBUG] Deal data received:", dealData);

      setDeal({
        ...dealData,
        comments: dealData.comments || [],
      });

    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";

      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage =
          "Network error: Unable to connect to server. Please check if backend server is running on localhost:5000";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      console.error("[ERROR] Fetch deal failed:", err);
      setError(errorMessage);

      if (err instanceof Error && err.message.includes("not found")) {
        setTimeout(() => router.push("/deals"), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;

    try {
      setCommentsLoading(true);
      console.log(`[DEBUG] Fetching comments for deal: ${id}`);

      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/deals/${id}/comments`
      );

      if (response.ok) {
        const responseData = await response.json();
        const commentsData = responseData.data || responseData || [];
        setComments(commentsData);
        console.log(`[DEBUG] Comments loaded: ${commentsData.length} comments`);
      } else {
        console.error("Failed to fetch comments:", response.status);
        setComments([]);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchRelatedContacts = async () => {
    if (!deal) return;

    try {
      setContactsLoading(true);
      console.log("[DEBUG] Fetching related contacts for deal:", deal.id);

      const contactsToFetch: Contact[] = [];

      if (deal.contact && deal.contact.id && deal.contact.name) {
        contactsToFetch.push({
          id: deal.contact.id,
          name: deal.contact.name,
          email: deal.contact.email,
          phone: deal.contact.phone,
          position: deal.contact.position,
          company:
            deal.contact.company?.id && deal.contact.company?.name
              ? { id: deal.contact.company.id, name: deal.contact.company.name }
              : null,
        });
      }

      if (deal.company?.id) {
        console.log(`[DEBUG] Fetching contacts for company: ${deal.company.id}`);
        const response = await makeAuthenticatedRequest(
          `http://localhost:5000/api/contacts/company/${deal.company.id}`
        );
        if (response.ok) {
          const { data } = await response.json();
          data.forEach((contact: any) => {
            if (!contactsToFetch.find((c) => c.id === contact.id)) {
              contactsToFetch.push({
                id: contact.id,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                position: contact.position,
                company_id: contact.company_id,
                company: contact.company,
                created_at: contact.created_at,
              });
            }
          });
        }
      } else if (deal.lead?.company && !deal.company?.id) {
        console.log(`[DEBUG] Searching contacts by lead company: ${deal.lead.company}`);
        const response = await makeAuthenticatedRequest(
          `http://localhost:5000/api/contacts?search=${encodeURIComponent(
            deal.lead.company
          )}`
        );
        if (response.ok) {
          const { data } = await response.json();
          data.forEach((contact: any) => {
            if (
              contact.company?.name === deal.lead?.company &&
              !contactsToFetch.find((c) => c.id === contact.id)
            ) {
              contactsToFetch.push({
                id: contact.id,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                position: contact.position,
                company_id: contact.company_id,
                company: contact.company,
                created_at: contact.created_at,
              });
            }
          });
        }
      }

      setContacts(contactsToFetch);
      console.log(`[DEBUG] Related contacts loaded: ${contactsToFetch.length} contacts`);
    } catch (err) {
      console.error("Error fetching related contacts:", err);
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const addComment = async (text: string) => {
    if (!id || !currentUser) {
      throw new Error("Missing required data for adding comment");
    }

    try {
      console.log(`[DEBUG] Adding comment to deal: ${id}`);
      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/deals/${id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            user_id: currentUser.id,
            user_name: currentUser.name,
          }),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const newComment = responseData.data || responseData;
        setComments((prev) => [newComment, ...prev]);
        console.log("[DEBUG] Comment added successfully");
        return newComment;
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to add comment");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      throw err;
    }
  };

  const handleCreateContact = async () => {
    const name = prompt("Enter contact name:");
    if (!name || !name.trim()) return;

    const email = prompt("Enter contact email (optional):");
    const phone = prompt("Enter contact phone (optional):");
    const position = prompt("Enter contact position (optional):");

    try {
      console.log("[DEBUG] Creating new contact");
      const response = await makeAuthenticatedRequest(
        "http://localhost:5000/api/contacts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email?.trim() || null,
            phone: phone?.trim() || null,
            position: position?.trim() || null,
            company_id: deal?.company?.id || null,
          }),
        }
      );

      if (response.ok) {
        const { data } = await response.json();
        setContacts((prev) => [data, ...prev]);
        alert("Contact created successfully!");
        console.log("[DEBUG] Contact created:", data);
      } else {
        const error = await response.json();
        alert(`Failed to create contact: ${error.message}`);
      }
    } catch (err) {
      console.error("Error creating contact:", err);
      alert("Failed to create contact");
    }
  };

  const renderTabContent = () => {
    if (!deal) return null;

    switch (activeTab) {
      case "Comments":
        return (
          <DealCommentTab dealId={String(deal.id)} currentUser={currentUser} />
        );
      case "Emails":
      case "Calls":
      case "Notes":
      case "Attachments":
      case "Data":
      case "Tasks":
        return (
          <TabContent
            activeTab={activeTab}
            deal={currentDeal}
            comments={comments}
            commentsLoading={commentsLoading}
            displayValue={displayValue}
            formatTimeAgo={formatTimeAgo}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
            formatDate={formatDate}
            getFirstChar={getFirstChar}
            addComment={addComment}
          />
        );
      default:
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab}
              </h3>
              <p className="text-gray-500">
                {activeTab} content for this deal will be displayed here.
              </p>
            </div>
          </div>
        );
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Invalid deal ID");
      return;
    }
    fetchDeal();
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (deal) {
      fetchRelatedContacts();
    }
  }, [deal]);

  const currentDeal = deal || {
    id: Array.isArray(id) ? id[0] : id || "",
    title: "",
    value: 0,
    stage: "proposal",
    probability: 0,
    owner: null,
    lead: null,
    company: null,
    contact: null,
    creator: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: "",
  };

  if (userLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
        <div
          className={`flex-1 ${isMinimized ? "ml-16" : "ml-50"
            } flex items-center justify-center`}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Authenticating...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
        <div
          className={`flex-1 ${isMinimized ? "ml-16" : "ml-50"
            } transition-all duration-300`}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md mx-4">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error Loading Deal
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={fetchDeal}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.back()}
                  className="border border-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
        <div
          className={`flex-1 ${isMinimized ? "ml-16" : "ml-50"
            } flex items-center justify-center transition-all duration-300`}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading deal details...</p>
            <p className="text-gray-400 text-sm mt-1">Deal ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      <div className={`flex-1 ${isMinimized ? "ml-16" : "ml-50"} flex transition-all duration-300`}>
        {/* Main Content */}
        <div className="flex-1 bg-white shadow-sm">
          {/* Deal Header with Assignment functionality */}
          <DealHeader
            deal={currentDeal}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            displayValue={displayValue}
            onDealUpdate={handleDealUpdate}
          />

          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Sidebar */}
        <RightSidebar
          deal={currentDeal}
          contacts={contacts}
          contactsLoading={contactsLoading}
          isContactsExpanded={isContactsExpanded}
          setIsContactsExpanded={setIsContactsExpanded}
          isOrgDetailsExpanded={isOrgDetailsExpanded}
          setIsOrgDetailsExpanded={setIsOrgDetailsExpanded}
          getFirstChar={getFirstChar}
          displayValue={displayValue}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          handleCreateContact={handleCreateContact}
        />
      </div>
    </div>
  );
}