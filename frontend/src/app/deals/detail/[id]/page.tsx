"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Mail,
  Link2,
  ChevronDown,
  Plus,
  Edit,
  MessageSquare,
  Check,
  User,
  Building2,
  Bell,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  X,
  CheckCircle,
  Circle,
  Activity,
  Zap,
  FileText,
  Phone,
  Users,
  Paperclip,
  StickyNote,
  AlertCircle,
  BarChart3,
  CheckSquare,
  Database,
  MoreHorizontal
} from "lucide-react";

import Sidebar from "@/components/Sidebar";

interface Deal {
  id: string | number;
  title?: string | null;
  value?: number | null;
  stage?: string | null;
  probability?: number | null;
  lead?: {
    id?: number;
    company?: string | null;
    fullname?: string | null;
    email?: string | null;
    phone?: string | null;
    industry?: string | null;
  } | null;
  company?: {
    id?: number;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  contact?: {
    id?: number;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    position?: string | null;
    company?: {
      id?: number;
      name?: string | null;
    } | null;
  } | null;
  creator?: {
    name?: string | null;
    email?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
  description?: string | null;
  comments?: Comment[] | null;
}

interface Contact {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  company_id?: number | null;
  company?: {
    id: number;
    name: string;
  } | null;
  created_at?: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
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

  const formatCurrency = (value: any): string => {
    const num = parseFloat(String(value || 0));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatPercentage = (value: any): string => {
    const num = parseFloat(String(value || 0));
    return `${num.toFixed(0)}%`;
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
    return formatDate(dateString);
  };

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

  const fetchDeal = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/deals/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Deal with ID ${id} not found`);
        }
        
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }
      
      const { data } = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data format received from server");
      }
      
      setDeal({
        ...data,
        comments: data.comments || []
      });
      
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
        setTimeout(() => router.push('/deals'), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await fetch(`http://localhost:5000/api/deals/${id}/comments`);
      
      if (response.ok) {
        const { data } = await response.json();
        setComments(data.map((comment: any) => ({
          id: comment.id,
          text: comment.message,
          author: comment.user?.name || comment.user_name || 'Unknown',
          created_at: comment.created_at
        })));
      } else {
        console.error('Failed to fetch comments');
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Fetch related contacts based on deal's company
  const fetchRelatedContacts = async () => {
    if (!deal) return;
    
    try {
      setContactsLoading(true);
      
      // Get contacts related to this deal
      const contactsToFetch: Contact[] = [];
      
      // 1. Add the direct contact from deal if exists
      if (deal.contact && deal.contact.id && deal.contact.name) {
        contactsToFetch.push({
          id: deal.contact.id,
          name: deal.contact.name,
          email: deal.contact.email,
          phone: deal.contact.phone,
          position: deal.contact.position,
          company: (deal.contact.company && deal.contact.company.id && deal.contact.company.name) ? { id: deal.contact.company.id, name: deal.contact.company.name } : null
        });
      }
      
      // 2. Fetch all contacts from the same company
      if (deal.company?.id) {
        const response = await fetch(`http://localhost:5000/api/contacts/company/${deal.company.id}`);
        if (response.ok) {
          const { data } = await response.json();
          // Add company contacts that aren't already included
          data.forEach((contact: any) => {
            if (!contactsToFetch.find(c => c.id === contact.id)) {
              contactsToFetch.push({
                id: contact.id,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                position: contact.position,
                company_id: contact.company_id,
                company: contact.company,
                created_at: contact.created_at
              });
            }
          });
        }
      }
      
      // 3. If no company but deal has lead company info, search contacts by company name
      else if (deal.lead?.company && !deal.company?.id) {
        const response = await fetch(`http://localhost:5000/api/contacts?search=${encodeURIComponent(deal.lead.company)}`);
        if (response.ok) {
          const { data } = await response.json();
          data.forEach((contact: any) => {
            if (contact.company?.name === deal.lead?.company && !contactsToFetch.find(c => c.id === contact.id)) {
              contactsToFetch.push({
                id: contact.id,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                position: contact.position,
                company_id: contact.company_id,
                company: contact.company,
                created_at: contact.created_at
              });
            }
          });
        }
      }
      
      setContacts(contactsToFetch);
      
    } catch (err) {
      console.error('Error fetching related contacts:', err);
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const addComment = async (text: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/deals/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          user_id: 1,
          user_name: 'Current User'
        }),
      });

      if (response.ok) {
        const { data } = await response.json();
        setComments(prev => [{
          id: data.id,
          text: data.message,
          author: data.user?.name || data.user_name || 'Unknown',
          created_at: data.created_at
        }, ...prev]);
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const handleCreateContact = async () => {
    const name = prompt('Enter contact name:');
    if (!name || !name.trim()) return;

    const email = prompt('Enter contact email (optional):');
    const phone = prompt('Enter contact phone (optional):');
    const position = prompt('Enter contact position (optional):');

    try {
      const response = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          position: position?.trim() || null,
          company_id: deal?.company?.id || null
        }),
      });

      if (response.ok) {
        const { data } = await response.json();
        setContacts(prev => [data, ...prev]);
        alert('Contact created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create contact: ${error.message}`);
      }
    } catch (err) {
      console.error('Error creating contact:', err);
      alert('Failed to create contact');
    }
  };

  const handleContactAction = (contactId: number, action: string) => {
    switch (action) {
      case 'view':
        router.push(`/contacts/${contactId}`);
        break;
      case 'edit':
        // Implement edit contact functionality
        console.log('Edit contact', contactId);
        break;
      case 'delete':
        // Implement delete contact functionality
        console.log('Delete contact', contactId);
        break;
      default:
        console.log('Unknown action', action);
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

  // Fetch related contacts when deal data is loaded
  useEffect(() => {
    if (deal) {
      fetchRelatedContacts();
    }
  }, [deal]);

  const renderTabContent = () => {
    if (!deal) return null;

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

      case "Emails":
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

      case "Comments":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
              <button 
                onClick={() => {
                  const commentText = prompt('Enter your comment:');
                  if (commentText) {
                    addComment(commentText).catch(() => alert('Failed to add comment'));
                  }
                }}
                className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />
                <span>Add Comment</span>
              </button>
            </div>

            {commentsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-blue-600">
                          {getFirstChar(comment.author)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Comments for {displayValue(deal.title, 'this deal')}
                </h3>
                <button 
                  onClick={() => {
                    const commentText = prompt('Enter your comment:');
                    if (commentText) {
                      addComment(commentText).catch(() => alert('Failed to add comment'));
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add Comment
                </button>
              </div>
            )}
          </div>
        );

      case "Data":
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

      default:
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">
              {activeTab} content for {displayValue(deal.title, 'this deal')}
            </h3>
          </div>
        );
    }
  };

  const currentDeal = deal || {
    id: id || '',
    title: '',
    value: 0,
    stage: 'New',
    probability: 0,
    lead: null,
    company: null,
    contact: null,
    creator: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: ''
  };

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
        <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-50'} transition-all duration-300`}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Deal</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-x-4">
                <button 
                  onClick={fetchDeal}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => router.back()}
                  className="border border-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
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
        <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-50'} flex items-center justify-center`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading deal details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

      <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-50'} flex`}>
        <div className="flex-1 bg-white">
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2 text-gray-600 text-sm">
                <span>Deals</span>
                <span>/</span>
                <span className="text-gray-900">
                  {displayValue(currentDeal.title, currentDeal.lead?.company || currentDeal.company?.name || 'Untitled Deal')}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">CRM-DEAL-{currentDeal.id}</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {displayValue(currentDeal.title, currentDeal.lead?.company || currentDeal.company?.name || 'Untitled Deal')}
                </h1>
                <div className="flex items-center space-x-2">
                  {(currentDeal.lead?.email || currentDeal.contact?.email || currentDeal.company?.email) && (
                    <a href={`mailto:${currentDeal.lead?.email || currentDeal.contact?.email || currentDeal.company?.email}`}>
                      <Mail className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </a>
                  )}
                  {(currentDeal.lead?.company || currentDeal.company?.name) && (
                    <a 
                      href={`https://${(currentDeal.lead?.company || currentDeal.company?.name)?.toLowerCase().replace(/\s+/g, '')}.com`}
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
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 flex items-center space-x-2 hover:bg-gray-50"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>{displayValue(currentDeal.stage, 'New')}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex space-x-0 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab.name === activeTab
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

          {renderTabContent()}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-700">
                {getFirstChar(currentDeal.title) || 
                 getFirstChar(currentDeal.lead?.company) || 
                 getFirstChar(currentDeal.company?.name) || 'D'}
              </span>
            </div>
            <div className="flex space-x-2">
              {(currentDeal.lead?.email || currentDeal.contact?.email || currentDeal.company?.email) && (
                <a href={`mailto:${currentDeal.lead?.email || currentDeal.contact?.email || currentDeal.company?.email}`}>
                  <Mail className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </a>
              )}
              {(currentDeal.lead?.company || currentDeal.company?.name) && (
                <a 
                  href={`https://${(currentDeal.lead?.company || currentDeal.company?.name)?.toLowerCase().replace(/\s+/g, '')}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Link2 className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </a>
              )}
              <Paperclip className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </div>
          </div>

          {/* Contacts Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <button
                  onClick={() => setIsContactsExpanded(!isContactsExpanded)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isContactsExpanded ? '' : '-rotate-90'}`} />
                </button>
                Contacts
                {contacts.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {contacts.length}
                  </span>
                )}
              </h3>
              <button onClick={handleCreateContact}>
                <Plus className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {isContactsExpanded && (
              <div className="space-y-3">
                {contactsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading contacts...</p>
                  </div>
                ) : contacts.length > 0 ? (
                  contacts.map((contact, index) => (
                    <div key={contact.id} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-700">
                            {getFirstChar(contact.name)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {contact.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            {index === 0 && currentDeal.contact?.id === contact.id && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Primary
                              </span>
                            )}
                            {contact.position && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {contact.position}
                              </span>
                            )}
                          </div>
                          {contact.email && (
                            <p className="text-xs text-gray-500 mt-1">{contact.email}</p>
                          )}
                          {contact.phone && (
                            <p className="text-xs text-gray-500">{contact.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} title="Send Email">
                            <Mail className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} title="Call">
                            <Phone className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          </a>
                        )}
                        <div className="relative">
                          <button 
                            onClick={() => {
                              const action = prompt('Choose action: view, edit, delete');
                              if (action) handleContactAction(contact.id, action);
                            }}
                            title="More options"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleContactAction(contact.id, 'view')}
                          title="View contact details"
                        >
                          <ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500 mb-2">No contacts found</p>
                    <button 
                      onClick={handleCreateContact}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Add Contact
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Organization Details Section */}
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
                      currentDeal.company?.name || currentDeal.lead?.company, 
                      'Not specified'
                    )}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm text-gray-600 col-span-1">Primary Contact</span>
                  <span className="text-sm text-gray-900 font-medium col-span-2">
                    {displayValue(
                      currentDeal.contact?.name || currentDeal.lead?.fullname, 
                      'Not specified'
                    )}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm text-gray-600 col-span-1">Email</span>
                  <span className="text-sm text-gray-900 font-medium col-span-2">
                    {(currentDeal.contact?.email || currentDeal.lead?.email || currentDeal.company?.email) ? (
                      <a 
                        href={`mailto:${currentDeal.contact?.email || currentDeal.lead?.email || currentDeal.company?.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {currentDeal.contact?.email || currentDeal.lead?.email || currentDeal.company?.email}
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm text-gray-600 col-span-1">Phone</span>
                  <span className="text-sm text-gray-900 font-medium col-span-2">
                    {(currentDeal.contact?.phone || currentDeal.lead?.phone || currentDeal.company?.phone) ? (
                      <a 
                        href={`tel:${currentDeal.contact?.phone || currentDeal.lead?.phone || currentDeal.company?.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {currentDeal.contact?.phone || currentDeal.lead?.phone || currentDeal.company?.phone}
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm text-gray-600 col-span-1">Address</span>
                  <span className="text-sm text-gray-900 font-medium col-span-2">
                    {displayValue(currentDeal.company?.address, 'Not specified')}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm text-gray-600 col-span-1">Industry</span>
                  <span className="text-sm text-gray-900 font-medium col-span-2">
                    {displayValue(currentDeal.lead?.industry, 'Not specified')}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm text-gray-600 col-span-1">Deal Owner</span>
                  <span className="text-sm text-gray-900 font-medium col-span-2">
                    {displayValue(currentDeal.creator?.name, 'Not assigned')}
                  </span>
                </div>

                {/* Deal Value and Stage */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 items-center mb-3">
                    <span className="text-sm text-gray-600 col-span-1">Deal Value</span>
                    <span className="text-sm text-gray-900 font-medium col-span-2">
                      {formatCurrency(currentDeal.value)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 items-center mb-3">
                    <span className="text-sm text-gray-600 col-span-1">Stage</span>
                    <span className="text-sm text-gray-900 font-medium col-span-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {displayValue(currentDeal.stage, 'New')}
                      </span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm text-gray-600 col-span-1">Created</span>
                    <span className="text-sm text-gray-900 font-medium col-span-2">
                      {formatDate(currentDeal.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}