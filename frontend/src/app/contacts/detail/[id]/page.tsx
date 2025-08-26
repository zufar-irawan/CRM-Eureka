"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Trash2, 
  ArrowLeft, 
  Edit, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Handshake,
  Eye,
  Plus,
  CheckSquare,
  Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';
import { checkAuthStatus } from '../../../../../utils/auth';

interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  company_id: number | null;
  created_at: string;
  updated_at: string;
  company?: {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
  };
  deals?: Array<{
    id: number;
    title: string;
    value: number;
    stage: string;
    created_at: string;
    updated_at: string;
  }>;
}

interface Task {
  id: number;
  code: string;
  lead_id: number;
  assigned_to: number;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  assigned_user_name: string;
  created_by_name: string;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  lead?: {
    id: number;
    code: string;
    company: string;
    fullname: string;
  };
}

const ContactDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id;
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/contacts/${contactId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch contact');
        }
        const data = await response.json();
        setContact(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        // Use the new contact tasks endpoint
        const response = await fetch(`/api/contacts/${contactId}/tasks`);
        
        if (response.ok) {
          const data = await response.json();
          setTasks(data.data || []);
        } else {
          // Fallback to search method if endpoint doesn't exist yet
          if (contact) {
            const searchQuery = contact.company?.name || contact.name;
            const searchResponse = await fetch(`/api/tasks?search=${encodeURIComponent(searchQuery)}`);
            
            if (searchResponse.ok) {
              const searchData = await searchResponse.json();
              const filteredTasks = searchData.data?.filter((task: Task) => 
                task.lead?.company?.toLowerCase().includes(contact.company?.name?.toLowerCase() || '') ||
                task.lead?.fullname?.toLowerCase().includes(contact.name?.toLowerCase() || '')
              ) || [];
              setTasks(filteredTasks);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    if (contactId) {
      fetchTasks();
    }
  }, [contactId, contact]);

  const handleDeleteContact = async () => {
    if (!contact) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You won't be able to revert this! This will delete ${contact.name} and all associated data.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/contacts/${contactId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete contact');
        }

        Swal.fire({
          title: 'Deleted!',
          text: 'Contact has been deleted successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        router.push('/contacts');
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete contact. Please try again.',
          icon: 'error'
        });
      }
    }
  };

  const handleEditContact = () => {
    router.push(`/contacts/${contactId}/edit`);
  };

  const handleCreateTask = () => {
    // Since tasks are associated with leads, you might want to:
    // 1. Navigate to a lead selection page first, or  
    // 2. Navigate to create task and let user select the lead, or
    // 3. If there's a direct relationship, pass relevant info
    router.push(`/tasks/create`);
  };

  const handleGoBack = () => {
    router.back();
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'prospecting':
        return 'bg-slate-100 text-slate-700';
      case 'qualification':
        return 'bg-blue-50 text-blue-700';
      case 'proposal':
        return 'bg-amber-50 text-amber-700';
      case 'negotiation':
        return 'bg-orange-50 text-orange-700';
      case 'closed won':
        return 'bg-green-50 text-green-700';
      case 'closed lost':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-50 text-blue-700';
      case 'pending':
        return 'bg-amber-50 text-amber-700';
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-700';
      case 'medium':
        return 'bg-amber-50 text-amber-700';
      case 'low':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-3">{error}</div>
          <button
            onClick={handleGoBack}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="mb-3">Contact not found</div>
          <button
            onClick={handleGoBack}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const nameParts = contact.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoBack}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{contact.name}</h1>
                {contact.company && (
                  <p className="text-sm text-slate-600">{contact.company.name}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleDeleteContact}
              className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Contact Details */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between p-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <h2 className="font-medium text-slate-900">Contact Details</h2>
            </div>
            <button
              onClick={handleEditContact}
              className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:bg-slate-50 rounded text-sm transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-slate-500 text-xs font-medium mb-1">First Name</div>
                <div className="text-slate-900">{firstName}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-medium mb-1">Last Name</div>
                <div className="text-slate-900">{lastName}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-medium mb-1">Email</div>
                <div className={contact.email ? "text-blue-600 hover:underline cursor-pointer" : "text-slate-400"}>
                  {contact.email || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-medium mb-1">Phone</div>
                <div className={contact.phone ? "text-slate-900" : "text-slate-400"}>
                  {contact.phone || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-medium mb-1">Position</div>
                <div className={contact.position ? "text-slate-900" : "text-slate-400"}>
                  {contact.position || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-medium mb-1">Company</div>
                <div className={contact.company?.name ? "text-slate-900" : "text-slate-400"}>
                  {contact.company?.name || "Not specified"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deals */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex items-center p-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Handshake className="w-4 h-4 text-slate-500" />
              <h2 className="font-medium text-slate-900">
                Deals ({contact.deals?.length || 0})
              </h2>
            </div>
          </div>

          {contact.deals && contact.deals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 font-medium text-slate-700">Title</th>
                    <th className="text-left p-3 font-medium text-slate-700">Value</th>
                    <th className="text-left p-3 font-medium text-slate-700">Stage</th>
                    <th className="text-left p-3 font-medium text-slate-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {contact.deals.map((deal) => (
                    <tr key={deal.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{deal.title}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{formatCurrency(deal.value)}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStageColor(deal.stage)}`}>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          {deal.stage}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-600">
                          {new Date(deal.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Handshake className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <div className="text-slate-600">No deals yet</div>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex items-center p-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-slate-500" />
              <h2 className="font-medium text-slate-900">
                Tasks ({tasks.length})
              </h2>
            </div>
          </div>

          {tasksLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
              <div className="text-slate-600">Loading tasks...</div>
            </div>
          ) : tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 font-medium text-slate-700">Code</th>
                    <th className="text-left p-3 font-medium text-slate-700">Title</th>
                    <th className="text-left p-3 font-medium text-slate-700">Lead</th>
                    <th className="text-left p-3 font-medium text-slate-700">Category</th>
                    <th className="text-left p-3 font-medium text-slate-700">Status</th>
                    <th className="text-left p-3 font-medium text-slate-700">Priority</th>
                    <th className="text-left p-3 font-medium text-slate-700">Assigned To</th>
                    <th className="text-left p-3 font-medium text-slate-700">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-mono text-xs text-slate-600">{task.code}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</div>
                        )}
                      </td>
                      <td className="p-3">
                        {task.lead ? (
                          <div>
                            <div className="text-xs font-mono text-slate-500">{task.lead.code}</div>
                            <div className="text-sm text-slate-900">{task.lead.company}</div>
                            <div className="text-xs text-slate-600">{task.lead.fullname}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">No lead</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {task.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          <div className="w-1 h-1 bg-current rounded-full"></div>
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-900">{task.assigned_user_name}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-600">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : (
                            <span className="text-slate-400">No due date</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <div className="text-slate-600">No tasks yet</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContactDetailPage;