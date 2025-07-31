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
  AlertCircle
} from "lucide-react";

interface Deal {
  id: string | number;
  title?: string | null;
  value?: number | null;
  stage?: string | null;
  probability?: number | null;
  organization?: string | null;
  website?: string | null;
  annual_revenue?: number | null;
  next_step?: string | null;
  deal_owner?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  description?: string | null;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  created_at: string;
}

interface Contact {
  id: string | number;
  company_id: string | number;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  created_at?: string;
  updated_at?: string;
}

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('activity');
  const [isContactsExpanded, setIsContactsExpanded] = useState(true);
  const [isOrgDetailsExpanded, setIsOrgDetailsExpanded] = useState(true);

  // Fetch deal data
  const fetchDeal = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/deals/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Deal not found');
        }
        throw new Error(`Failed to fetch deal: ${response.status}`);
      }
      
      const dealData = await response.json();
      setDeal(dealData);
    } catch (err) {
      console.error('Error fetching deal:', err);
      setError(err instanceof Error ? err.message : 'Failed to load deal');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const response = await fetch(`/api/deals/${id}/contacts`);
      
      if (response.ok) {
        const contactsData = await response.json();
        setContacts(contactsData);
      } else {
        console.error('Failed to fetch contacts');
        setContacts([]);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  // Add new contact
  const addContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`/api/deals/${id}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contactData,
          company_id: deal?.organization || deal?.id // Use organization or deal id as company_id
        }),
      });

      if (response.ok) {
        const newContact = await response.json();
        setContacts(prev => [...prev, newContact]);
        return newContact;
      } else {
        throw new Error('Failed to add contact');
      }
    } catch (err) {
      console.error('Error adding contact:', err);
      throw err;
    }
  };

  // Delete contact
  const deleteContact = async (contactId: string | number) => {
    try {
      const response = await fetch(`/api/deals/${id}/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setContacts(prev => prev.filter(contact => contact.id !== contactId));
      } else {
        throw new Error('Failed to delete contact');
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      throw err;
    }
  };
  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await fetch(`/api/deals/${id}/comments`);
      
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
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

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchDeal();
      fetchComments();
      fetchContacts();
    }
  }, [id]);

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  const displayValue = (value: any, fallback: string = 'Not specified'): string => {
    const str = safeString(value);
    return str.length > 0 ? str : fallback;
  };

  const getFirstChar = (str: string | null | undefined, fallback: string = '?'): string => {
    if (!str || str.length === 0) return fallback;
    return str.charAt(0).toUpperCase();
  };

  const formatCurrency = (value: any): string => {
    const num = parseFloat(String(value || 0));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatPercentage = (value: any): string => {
    const num = parseFloat(String(value || 0));
    return `${num.toFixed(2)}%`;
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
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'data', label: 'Data', icon: FileText },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'tasks', label: 'Tasks', icon: Check },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'attachments', label: 'Attachments', icon: Paperclip }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deal details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
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
    );
  }

  // No deal found
  if (!deal) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Deal Not Found</h2>
          <p className="text-gray-600 mb-6">The deal you're looking for doesn't exist or may have been deleted.</p>
          <button 
            onClick={() => router.back()}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main content area */}
      <div className="flex-1">
        <div className="min-h-screen bg-white">
          {/* Tabs */}
          <div className="border-b bg-white">
            <div className="flex overflow-x-auto px-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex">
            {/* Left content */}
            <div className="flex-1 p-8">
              {activeTab === 'activity' && (
                <div className="max-w-4xl">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-semibold text-gray-900">Activity</h2>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{displayValue(deal.deal_owner, 'Unknown')}</span> created this deal
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
                            <span className="font-semibold">{displayValue(deal.deal_owner, 'Unknown')}</span> updated deal stage to {displayValue(deal.stage, 'Unknown')}
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

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-10 pt-8 border-t border-gray-200">
                    <button className="flex items-center gap-2 border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      <Mail className="w-4 h-4" />
                      Reply
                    </button>
                    <button className="flex items-center gap-2 border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      Comment
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'emails' && (
                <div className="max-w-4xl">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-semibold text-gray-900">Emails</h2>
                    <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                      <Plus className="w-4 h-4" />
                      Compose
                    </button>
                  </div>
                  <div className="text-center py-16 text-gray-500">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No emails found</h3>
                    <p className="text-sm">Start a conversation by sending an email</p>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="max-w-4xl">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
                    <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                      <Plus className="w-4 h-4" />
                      Add Comment
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
                    <div className="text-center py-16 text-gray-500">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">No comments yet</h3>
                      <p className="text-sm">Add a comment to start the conversation</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'data' && (
                <div className="max-w-4xl">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-semibold text-gray-900">Deal Data</h2>
                    <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                      <Edit className="w-4 h-4" />
                      Edit
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
                        <p className="text-2xl font-bold text-gray-900">{formatPercentage(deal.probability)}</p>
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
                        <p className="text-base text-gray-600">{displayValue(deal.deal_owner)}</p>
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
              )}

              {/* Other tabs default content */}
              {!['activity', 'emails', 'comments', 'data'].includes(activeTab) && (
                <div className="text-center py-16 text-gray-500 max-w-4xl">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No {activeTab} found</h3>
                  <p className="text-sm">This section is currently empty</p>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="w-80 border-l bg-gray-50">
              {/* Deal title section */}
              <div className="p-6 bg-white border-b">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {displayValue(deal.title, deal.organization || 'Untitled Deal')}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Circle className="w-4 h-4" />
                    <span>0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link2 className="w-4 h-4" />
                    <span>0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Paperclip className="w-4 h-4" />
                    <span>0</span>
                  </div>
                </div>
              </div>

              {/* Contacts section */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <button
                      onClick={() => setIsContactsExpanded(!isContactsExpanded)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isContactsExpanded ? '' : '-rotate-90'}`} />
                    </button>
                    Contacts ({contacts.length})
                  </h3>
                  <button 
                    onClick={() => {
                      // Handle add contact - you can implement a modal or form here
                      const name = prompt('Contact Name:');
                      if (!name) return;
                      
                      const email = prompt('Contact Email:');
                      const phone = prompt('Contact Phone:');
                      const position = prompt('Contact Position:');
                      
                      addContact({ 
                        name, 
                        email: email || undefined, 
                        phone: phone || undefined,
                        position: position || undefined,
                        company_id: deal?.organization || deal?.id || ''
                      }).catch(err => alert('Failed to add contact'));
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <Plus className="w-4 h-4" />
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
                      contacts.map((contact) => (
                        <div key={contact.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-blue-600">
                                {getFirstChar(contact.name)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900">{contact.name}</span>
                                {contact.position && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">{contact.position}</span>
                                )}
                              </div>
                              {contact.email && (
                                <p className="text-xs text-gray-600 truncate mb-1">{contact.email}</p>
                              )}
                              {contact.phone && (
                                <p className="text-xs text-gray-600 truncate">{contact.phone}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this contact?')) {
                                    deleteContact(contact.id).catch(err => alert('Failed to delete contact'));
                                  }
                                }}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500 mb-2">No contacts available</p>
                        <button 
                          onClick={() => {
                            // Handle add contact
                            const name = prompt('Contact Name:');
                            if (!name) return;
                            
                            const email = prompt('Contact Email:');
                            const phone = prompt('Contact Phone:');
                            const position = prompt('Contact Position:');
                            
                            addContact({ 
                              name, 
                              email: email || undefined, 
                              phone: phone || undefined,
                              position: position || undefined,
                              company_id: deal?.organization || deal?.id || ''
                            }).catch(err => alert('Failed to add contact'));
                          }}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Add Contact
                        </button>
                      </div>
                    )}

                    {/* Show deal's contact info as fallback if no separate contacts exist */}
                    {contacts.length === 0 && (deal.contact_name || deal.contact_email || deal.contact_phone) && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm border-dashed">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-600">
                              {getFirstChar(deal.contact_name)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-700">{displayValue(deal.contact_name, 'Deal Contact')}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">From Deal</span>
                            </div>
                            {deal.contact_email && (
                              <p className="text-xs text-gray-600 truncate">{deal.contact_email}</p>
                            )}
                            {deal.contact_phone && (
                              <p className="text-xs text-gray-600 truncate">{deal.contact_phone}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => {
                                // Convert deal contact to separate contact
                                if (deal.contact_name) {
                                  const position = prompt('Contact Position (optional):');
                                  addContact({
                                    name: deal.contact_name,
                                    email: deal.contact_email || undefined,
                                    phone: deal.contact_phone || undefined,
                                    position: position || undefined,
                                    company_id: deal?.organization || deal?.id || ''
                                  }).catch(err => alert('Failed to add contact'));
                                }
                              }}
                              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                              title="Convert to separate contact"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Organization Details section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <button
                      onClick={() => setIsOrgDetailsExpanded(!isOrgDetailsExpanded)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isOrgDetailsExpanded ? '' : '-rotate-90'}`} />
                    </button>
                    Organization Details
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {isOrgDetailsExpanded && (
                  <div className="space-y-5 text-sm">
                    {deal.organization && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Organization</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{deal.organization}</span>
                          <ArrowUpRight className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Website</span>
                      <span className={`cursor-pointer hover:underline font-medium ${
                        deal.website ? 'text-blue-600' : 'text-blue-600'
                      }`}>
                        {deal.website || 'Add Website...'}
                      </span>
                    </div>

                    {(deal.annual_revenue !== null && deal.annual_revenue !== undefined) && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Annual Revenue</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(deal.annual_revenue)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Probability</span>
                      <span className="font-semibold text-gray-900">{formatPercentage(deal.probability)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Stage</span>
                      <span className="font-semibold text-gray-900">{displayValue(deal.stage)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Deal Value</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Next Step</span>
                      <span className={`cursor-pointer hover:underline font-medium ${
                        deal.next_step ? 'text-gray-900' : 'text-blue-600'
                      }`}>
                        {deal.next_step || 'Add Next Step...'}
                      </span>
                    </div>

                    {deal.deal_owner && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Deal Owner</span>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">{getFirstChar(deal.deal_owner)}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{deal.deal_owner}</span>
                        </div>
                      </div>
                    )}

                    {deal.description && (
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-gray-600 font-medium block mb-2">Description</span>
                        <p className="text-sm text-gray-700 leading-relaxed">{deal.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}