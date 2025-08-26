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
  Users,
  Plus
} from 'lucide-react';
import Swal from 'sweetalert2';
import { checkAuthStatus } from '../../../../../utils/auth';

interface Company {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  contacts?: Array<{
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    position: string | null;
    created_at: string;
  }>;
  deals?: Array<{
    id: number;
    title: string;
    value: number;
    stage: string;
    created_at: string;
    updated_at: string;
  }>;
}

const CompanyDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
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
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/companies/${companyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch company');
        }
        const data = await response.json();
        setCompany(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const handleDeleteCompany = async () => {
    if (!company) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You won't be able to revert this! This will delete ${company.name} and all associated data.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/companies/${companyId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete company');
        }

        Swal.fire({
          title: 'Deleted!',
          text: 'Company has been deleted successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        router.push('/companies');
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete company. Please try again.',
          icon: 'error'
        });
      }
    }
  };

  const handleEditCompany = () => {
    router.push(`/companies/${companyId}/edit`);
  };

  const handleCreateDeal = () => {
    router.push(`/deals/create?company_id=${companyId}`);
  };

  const handleCreateContact = () => {
    router.push(`/contacts/create?company_id=${companyId}`);
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

  if (!company) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="mb-3">Company not found</div>
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
                <h1 className="text-lg font-semibold text-slate-900">{company.name}</h1>
                <p className="text-sm text-slate-600">Company Details</p>
              </div>
            </div>
            <button
              onClick={handleDeleteCompany}
              className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        
        {/* Company Details */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between p-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <h2 className="font-medium text-slate-900">Company Details</h2>
            </div>
            <button
              onClick={handleEditCompany}
              className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:bg-slate-50 rounded text-sm transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-500 text-xs font-medium mb-1">Company Name</div>
                <div className="text-slate-900">{company.name}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-medium mb-1">Email</div>
                <div className={company.email ? "text-blue-600 hover:underline cursor-pointer" : "text-slate-400"}>
                  {company.email || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-medium mb-1">Phone</div>
                <div className={company.phone ? "text-slate-900" : "text-slate-400"}>
                  {company.phone || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-medium mb-1">Address</div>
                <div className={company.address ? "text-slate-900" : "text-slate-400"}>
                  {company.address || "Not specified"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deals */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between p-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Handshake className="w-4 h-4 text-slate-500" />
              <h2 className="font-medium text-slate-900">
                Deals ({company.deals?.length || 0})
              </h2>
            </div>
            <button
              onClick={handleCreateDeal}
              className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Deal
            </button>
          </div>

          {company.deals && company.deals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 font-medium text-slate-700">Title</th>
                    <th className="text-left p-3 font-medium text-slate-700">Value</th>
                    <th className="text-left p-3 font-medium text-slate-700">Stage</th>
                    <th className="text-left p-3 font-medium text-slate-700">Created</th>
                    <th className="text-left p-3 font-medium text-slate-700">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {company.deals.map((deal) => (
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
                      <td className="p-3">
                        <div className="text-slate-600">
                          {new Date(deal.updated_at).toLocaleDateString('en-US', {
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
              <div className="text-slate-600 mb-2">No deals yet</div>
              <button
                onClick={handleCreateDeal}
                className="text-blue-600 text-sm hover:underline"
              >
                Create the first deal
              </button>
            </div>
          )}
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between p-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <h2 className="font-medium text-slate-900">
                Contacts ({company.contacts?.length || 0})
              </h2>
            </div>
            <button
              onClick={handleCreateContact}
              className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Contact
            </button>
          </div>

          {company.contacts && company.contacts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 font-medium text-slate-700">Name</th>
                    <th className="text-left p-3 font-medium text-slate-700">Email</th>
                    <th className="text-left p-3 font-medium text-slate-700">Phone</th>
                    <th className="text-left p-3 font-medium text-slate-700">Position</th>
                    <th className="text-left p-3 font-medium text-slate-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {company.contacts.map((contact) => (
                    <tr 
                      key={contact.id} 
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => router.push(`/contacts/${contact.id}`)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="font-medium text-slate-900">{contact.name}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className={contact.email ? "text-blue-600 hover:underline" : "text-slate-400"}>
                          {contact.email || "Not specified"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className={contact.phone ? "text-slate-900" : "text-slate-400"}>
                          {contact.phone || "Not specified"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className={contact.position ? "text-slate-900" : "text-slate-400"}>
                          {contact.position || "Not specified"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-600">
                          {new Date(contact.created_at).toLocaleDateString('en-US', {
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
              <Users className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <div className="text-slate-600 mb-2">No contacts yet</div>
              <button
                onClick={handleCreateContact}
                className="text-blue-600 text-sm hover:underline"
              >
                Create the first contact
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CompanyDetailPage;