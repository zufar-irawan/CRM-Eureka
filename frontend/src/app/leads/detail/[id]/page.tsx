"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  Edit,
  MessageSquare,
  Database,
  StickyNote,
  Send,
  Smile,
  Reply,
  MoreHorizontal,
  Trash2,
  X,
  ChevronUp
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

interface Comment {
  id: number;
  lead_id: number;
  user_id?: number;
  user_name?: string;
  message: string;
  created_at: string;
  parent_id?: number | null;
  replies?: Comment[];
}

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

// Auth utility functions
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

const getCurrentUserFromStorage = (): CurrentUser | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing stored user data:', error);
  }
  return null;
};

const fetchCurrentUserFromAPI = async (): Promise<CurrentUser | null> => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const userData = await response.json();
    
    const userToStore = JSON.stringify(userData);
    localStorage.setItem('currentUser', userToStore);
    
    return userData;
  } catch (error) {
    console.error('Error fetching current user from API:', error);
    return null;
  }
};

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
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showNewComment, setShowNewComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // Reply state - updated to support nested replies
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMessages, setReplyMessages] = useState<{[key: number]: string}>({});
  const [replySubmitting, setReplySubmitting] = useState<{[key: number]: boolean}>({});

  // Modal state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Users and TO field state - updated for per-reply management
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [toFields, setToFields] = useState<{[key: number]: string}>({});
  const [selectedRecipients, setSelectedRecipients] = useState<{[key: number]: User[]}>({});
  const [showToDropdowns, setShowToDropdowns] = useState<{[key: number]: boolean}>({});
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Initialize current user
  useEffect(() => {
    const initializeUser = async () => {
      setUserLoading(true);
      
      // First try to get user from storage
      let user = getCurrentUserFromStorage();
      
      // If no user in storage or token exists, try to fetch from API
      if (!user || getAuthToken()) {
        const apiUser = await fetchCurrentUserFromAPI();
        if (apiUser) {
          user = apiUser;
        }
      }
      
      // If still no user, check if we have a token but failed API call
      if (!user && getAuthToken()) {
        console.warn('Authentication token exists but failed to fetch user data');
      }
      
      // Set user or fallback
      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          avatar: user.avatar
        });
      } else {
        // Fallback for development/testing
        console.warn('No user data found, using fallback user');
        setCurrentUser({
          id: 1,
          name: 'Admin User',
          email: 'admin@eureka.com',
          role: 'admin'
        });
      }
      
      setUserLoading(false);
    };

    initializeUser();
  }, [router]);

  // Fetch users from the API using the users route
  const fetchUsers = async () => {
    setUsersLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No auth token available');
        setUsersLoading(false);
        return;
      }

      const response = await makeAuthenticatedRequest('http://localhost:5000/api/users', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        const usersList = Array.isArray(data) ? data : [];
        setUsers(usersList);
        setFilteredUsers(usersList);
        console.log('Successfully loaded users from API:', usersList.length, 'users');
      } else if (response.status === 401) {
        console.log('API authentication failed');
        // Use fallback users for development
        const fallbackUsers: User[] = [
          { id: 1, name: 'Admin User', email: 'admin@eureka.com', role: 'admin' },
          { id: 2, name: 'Sales One', email: 'sales1@eureka.com', role: 'sales' },
          { id: 3, name: 'Partnership One', email: 'partner1@eureka.com', role: 'partnership' },
        ];
        setUsers(fallbackUsers);
        setFilteredUsers(fallbackUsers);
      } else {
        console.log(`API returned ${response.status}`);
      }
    } catch (error) {
      console.log('Failed to fetch users from API:', error);
      // Use fallback users on error
      const fallbackUsers: User[] = [
        { id: 1, name: 'Admin User', email: 'admin@eureka.com', role: 'admin' },
        { id: 2, name: 'Sales One', email: 'sales1@eureka.com', role: 'sales' },
        { id: 3, name: 'Partnership One', email: 'partner1@eureka.com', role: 'partnership' },
      ];
      setUsers(fallbackUsers);
      setFilteredUsers(fallbackUsers);
    } finally {
      setUsersLoading(false);
    }
  };

  // Filter users based on TO field input for specific reply
  useEffect(() => {
    const searchTerm = Object.values(toFields).join('').toLowerCase();
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [toFields, users]);

  // Handle TO field input change for specific reply
  const handleToFieldChange = (commentId: number, value: string) => {
    setToFields(prev => ({ ...prev, [commentId]: value }));
    
    if (value.trim()) {
      setShowToDropdowns(prev => ({ ...prev, [commentId]: true }));
    }

    // Parse existing recipients from the field
    const emails = value.split(',').map(email => email.trim()).filter(email => email);
    const recipients = emails.map(email => {
      const user = users.find(u => u.email === email);
      return user || { id: Date.now() + Math.random(), name: email, email: email };
    });
    setSelectedRecipients(prev => ({ ...prev, [commentId]: recipients }));
  };

  // Handle user selection from dropdown for specific reply
  const handleUserSelect = (commentId: number, user: User) => {
    const currentToField = toFields[commentId] || '';
    const currentEmails = currentToField.split(',').map(email => email.trim()).filter(email => email);
    
    // Check if user is already selected
    if (!currentEmails.includes(user.email)) {
      const newToField = currentEmails.length > 0 
        ? `${currentEmails.join(', ')}, ${user.email}`
        : user.email;
      setToFields(prev => ({ ...prev, [commentId]: newToField }));
      
      // Update selected recipients
      const currentRecipients = selectedRecipients[commentId] || [];
      if (!currentRecipients.find(r => r.email === user.email)) {
        const newRecipients = [...currentRecipients, user];
        setSelectedRecipients(prev => ({ ...prev, [commentId]: newRecipients }));
      }
    }
    
    setShowToDropdowns(prev => ({ ...prev, [commentId]: false }));
  };

  // Remove recipient for specific reply
  const removeRecipient = (commentId: number, emailToRemove: string) => {
    const currentToField = toFields[commentId] || '';
    const currentEmails = currentToField.split(',').map(email => email.trim()).filter(email => email);
    const filteredEmails = currentEmails.filter(email => email !== emailToRemove);
    setToFields(prev => ({ ...prev, [commentId]: filteredEmails.join(', ') }));
    
    const currentRecipients = selectedRecipients[commentId] || [];
    setSelectedRecipients(prev => ({ 
      ...prev, 
      [commentId]: currentRecipients.filter(r => r.email !== emailToRemove) 
    }));
  };

  // Initialize users fetch only once
  useEffect(() => {
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.to-field-container')) {
        setShowToDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Function to make authenticated API calls
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
      mode: 'cors',
    });
  };

  // Function to organize comments into nested structure
  const organizeComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    // First, create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Then, organize them into parent-child relationships
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parentComment = commentMap.get(comment.parent_id);
        if (parentComment) {
          parentComment.replies!.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
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

      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/leads/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          throw new Error(`Lead with ID ${id} not found`);
        }
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
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

  // Function to fetch comments
  const fetchComments = async () => {
    if (!id) return;

    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/leads/${id}/comments`, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access to comments');
          setCommentsError('Unauthorized access to comments');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const commentsArray = Array.isArray(data) ? data : [];
      setComments(organizeComments(commentsArray));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setCommentsError('Failed to load comments');
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Function to add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !id || !currentUser) return;

    setSubmitting(true);

    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/leads/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          message: newComment.trim(),
          user_name: currentUser.name,
          user_id: currentUser.id
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.comment) {
        // Re-fetch comments to maintain proper organization
        await fetchComments();
      }

      setNewComment('');
      setShowNewComment(false);

    } catch (error) {
      console.error('Error adding comment:', error);
      alert(`Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle reply to comment
  const handleReplyToComment = async (commentId: number) => {
    const replyMessage = replyMessages[commentId];
    if (!replyMessage?.trim() || !id || !currentUser) return;

    setReplySubmitting(prev => ({ ...prev, [commentId]: true }));

    try {
      const originalComment = findCommentById(comments, commentId);
      const replyText = `@${originalComment?.user_name || 'Unknown User'} ${replyMessage.trim()}`;

      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/leads/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          message: replyText,
          user_name: currentUser.name,
          user_id: currentUser.id,
          parent_id: commentId
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.comment) {
        // Re-fetch comments to maintain proper organization
        await fetchComments();
      }

      setReplyMessages(prev => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
      setToFields(prev => ({ ...prev, [commentId]: '' }));
      setSelectedRecipients(prev => ({ ...prev, [commentId]: [] }));
      setShowToDropdowns(prev => ({ ...prev, [commentId]: false }));

    } catch (error) {
      console.error('Error adding reply:', error);
      alert(`Failed to add reply: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setReplySubmitting(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Helper function to find comment by ID in nested structure
  const findCommentById = (comments: Comment[], id: number): Comment | null => {
    for (const comment of comments) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        const found = findCommentById(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Function to delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/leads/${id}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Re-fetch comments to maintain proper organization
      await fetchComments();

    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(`Failed to delete comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return 'Unknown date';
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
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/leads/${lead.id}/stage`, {
        method: 'PUT',
        body: JSON.stringify({
          stage: statusOption.backendStage
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

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

  const handleConvertToDeal = async (leadId: string, dealTitle: string, dealValue: number, dealStage: string) => {
    if (!lead) {
      console.error('[ERROR] No lead data available for conversion');
      throw new Error('No lead data available');
    }

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

    const response = await makeAuthenticatedRequest(`http://localhost:5000/api/leads/${leadId}/convert`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Unauthorized access - redirecting to login');
        router.push('/login');
        return;
      }
      const errorData = await response.json().catch(() => null);
      console.error('[DEBUG] Error response:', errorData);
      throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  };

  const handleModalClose = async () => {
    setShowConvertModal(false);
    await fetchLead();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleReplyKeyPress = (e: React.KeyboardEvent, commentId: number) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleReplyToComment(commentId);
    }
  };

  // Recursive function to render comments with replies
  const renderComment = (comment: Comment, depth: number = 0) => {
    const maxDepth = 5; // Limit nesting depth
    const indentClass = depth > 0 ? `ml-${Math.min(depth * 8, 32)}` : '';
    
    return (
      <div key={comment.id} className={`space-y-4 ${indentClass}`}>
        {/* Comment */}
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">
                  {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {comment.user_name || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                  {comment.user_id === currentUser?.id && (
                    <span className="ml-2 text-blue-600">(You)</span>
                  )}
                  {depth > 0 && (
                    <span className="ml-2 text-purple-600">• Reply</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {depth < maxDepth && (
                <button 
                  onClick={() => setReplyingTo(comment.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Reply className="w-4 h-4" />
                </button>
              )}
              <div className="relative group">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {/* Only show delete option if it's the user's comment or if user is admin */}
                  {(comment.user_id === currentUser?.id || currentUser?.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {comment.message}
          </div>
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className={`${depth > 0 ? 'ml-4' : 'ml-8'} border border-gray-200 rounded-lg bg-white shadow-sm`}>
            {/* Email-like header */}
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Reply className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Reply</span>
                </div>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyMessages(prev => ({ ...prev, [comment.id]: '' }));
                    setToFields(prev => ({ ...prev, [comment.id]: '' }));
                    setSelectedRecipients(prev => ({ ...prev, [comment.id]: [] }));
                    setShowToDropdowns(prev => ({ ...prev, [comment.id]: false }));
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                {/* Enhanced TO field with dropdown */}
                <div className="flex items-start space-x-2">
                  <span className="text-gray-600 font-medium pt-2">TO:</span>
                  <div className="flex-1 to-field-container relative">
                    <input
                      type="text"
                      value={toFields[comment.id] || comment.user_name || 'Unknown User'}
                      onChange={(e) => handleToFieldChange(comment.id, e.target.value)}
                      onFocus={() => setShowToDropdowns(prev => ({ ...prev, [comment.id]: true }))}
                      placeholder="Type to search users..."
                      disabled={usersLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    
                    {/* Dropdown */}
                    {showToDropdowns[comment.id] && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                        {usersLoading ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                            Loading users...
                          </div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            {(toFields[comment.id] || '').trim() ? 'No users found' : 'Start typing to search users'}
                          </div>
                        ) : (
                          <div className="py-1">
                            {filteredUsers.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => handleUserSelect(comment.id, user)}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-medium text-blue-700">
                                    {getFirstChar(user.name)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {user.email}
                                    {user.role && (
                                      <span className="ml-1 text-blue-600">• {user.role}</span>
                                    )}
                                  </p>
                                </div>
                                {(selectedRecipients[comment.id] || []).find(r => r.email === user.email) && (
                                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Selected recipients chips */}
                    {(selectedRecipients[comment.id] || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(selectedRecipients[comment.id] || []).map((recipient, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            <span>{recipient.name}</span>
                            <button
                              onClick={() => removeRecipient(comment.id, recipient.email)}
                              className="hover:text-blue-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowToDropdowns(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {showToDropdowns[comment.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">SUBJECT:</span>
                  <span className="text-gray-900">
                    Re: Comment on {displayValue(lead?.fullname)} (#CRM-LEAD-{lead?.id})
                  </span>
                </div>
              </div>
            </div>

            {/* Reply content */}
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-700">
                    {currentUser ? getFirstChar(currentUser.name) : 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900">
                    {currentUser?.name || 'Current User'}
                  </p>
                </div>
              </div>
              <textarea
                value={replyMessages[comment.id] || ''}
                onChange={(e) => setReplyMessages(prev => ({ ...prev, [comment.id]: e.target.value }))}
                onKeyDown={(e) => handleReplyKeyPress(e, comment.id)}
                placeholder="Type your reply..."
                className="w-full h-24 p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Reply actions */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyMessages(prev => ({ ...prev, [comment.id]: '' }));
                    setToFields(prev => ({ ...prev, [comment.id]: '' }));
                    setSelectedRecipients(prev => ({ ...prev, [comment.id]: [] }));
                    setShowToDropdowns(prev => ({ ...prev, [comment.id]: false }));
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Discard
                </button>
                <button
                  onClick={() => handleReplyToComment(comment.id)}
                  disabled={!(replyMessages[comment.id] || '').trim() || replySubmitting[comment.id]}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {replySubmitting[comment.id] ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Render nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (!userLoading) {
      fetchLead();
    }
  }, [id, router, userLoading]);

  // Fetch comments when Comments tab is active
  useEffect(() => {
    if (activeTab === "Comments" && id && !userLoading) {
      fetchComments();
    }
  }, [activeTab, id, userLoading]);

  // Show loading while user is being initialized
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

  const renderTabContent = () => {
    if (!lead) return null;

    switch (activeTab) {
      case "Comments":
        return (
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
              <button
                onClick={() => setShowNewComment(true)}
                className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />
                <span>New Comment</span>
              </button>
            </div>

            {/* Loading State */}
            {commentsLoading && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
              </div>
            )}

            {/* Error State */}
            {commentsError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-700 text-sm">{commentsError}</p>
                <button 
                  onClick={fetchComments}
                  className="text-red-700 text-sm underline mt-2"
                >
                  Try again
                </button>
              </div>
            )}

            {/* New Comment Form */}
            {showNewComment && (
              <div className="border border-gray-200 rounded-lg mb-6">
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {currentUser ? getFirstChar(currentUser.name) : 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser?.name || 'Current User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Commenting as {currentUser?.role || 'user'}
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Add a comment..."
                    className="w-full h-24 p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setShowNewComment(false);
                        setNewComment('');
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Comment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            {!commentsLoading && comments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">No Comments</h3>
                <button
                  onClick={() => setShowNewComment(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  New Comment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => renderComment(comment))}
              </div>
            )}

            {/* Bottom Action Buttons (when no new comment form is shown) */}
            {!showNewComment && comments.length > 0 && !replyingTo && (
              <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (comments.length > 0) {
                      setReplyingTo(comments[0].id);
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => setShowNewComment(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Comment</span>
                </button>
              </div>
            )}
          </div>
        );
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
    <div className="flex-1 flex">
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
        {/* Header with avatar and action icons */}
        <div className="flex items-center justify-between mb-8">
          {/* Avatar circle with initial */}
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-600">
              {getFirstChar(currentLead.fullname)}
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
              {currentLead.website ? (
                <a
                  href={safeString(currentLead.website).startsWith('http') ? safeString(currentLead.website) : `https://${safeString(currentLead.website)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {displayValue(currentLead.website)}
                </a>
              ) : (
                <span className="text-sm text-gray-500">Not specified</span>
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
                <span className="w-6 h-6 bg-gray-300 text-gray-700 rounded-sm flex items-center justify-center text-xs font-medium">
                  {getFirstChar(currentLead.owner, '?')}
                </span>
                <span className="text-sm text-gray-900 font-medium">
                  {displayValue(currentLead.owner)}
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
            <h3 className="text-lg font-semibold text-gray-900">Person</h3>
            <button onClick={() => console.log('Edit person')}>
              <Edit className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <div className="space-y-4">
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
              {currentLead.email ? (
                <a
                  href={`mailto:${safeString(currentLead.email)}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {displayValue(currentLead.email)}
                </a>
              ) : (
                <span className="text-sm text-gray-500">Not specified</span>
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

      {showConvertModal && lead && (
        <ConvertToDealModal
          onClose={handleModalClose}
          onConfirm={handleConvertToDeal}
          selectedCount={1}
          selectedIds={[String(lead?.id || '')]}
        />
      )}
    </div>
  );
}