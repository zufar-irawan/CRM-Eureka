"use client"

import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCircle,
  ChevronDown,
  Bell,
  BarChart3,
  Users,
  Handshake,
  CheckSquare,
  FileText,
  FileSignature,
  LineChart
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { getToken } from '../../../../../utils/auth';

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

  useEffect(() => {
    const token = getToken()

    if (!token) {
      Swal.fire({
        icon: "info",
        title: "You're not logged in",
        text: "Make sure to login first!"
      })

      router.replace('/login')
    }
  }, [router])

  const params = useParams();
  const companyId = params.id;
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deals' | 'contacts'>('deals');

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        console.log('Fetching company with ID:', companyId);

        const response = await fetch(`/api/companies/${companyId}`);
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.success) {
          console.log('Company data:', data.data);
          setCompany(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch company');
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div>Company not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Company Details */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen">
        {/* Company Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {company.name || 'Unnamed Company'}
              </h1>
            </div>
          </div>
          <button className="w-full px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center space-x-2 text-sm">
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>

        {/* Details Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h2 className="text-base font-semibold text-gray-900">Details</h2>
            <button className="text-gray-400 hover:text-gray-600">
              <Edit className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 flex-1 overflow-hidden">
            <div className="space-y-3 h-full">
              {/* Row 1 - Company Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <p className="text-xs text-gray-900 py-1">
                  {company.name}
                </p>
              </div>

              {/* Row 2 - Full width for email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                {company.email ? (
                  <p className="text-xs text-blue-600 py-1 hover:underline cursor-pointer break-all">
                    {company.email}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 py-1 border-b border-dashed border-gray-300 cursor-pointer hover:text-gray-700">
                    Add Email...
                  </p>
                )}
              </div>

              {/* Row 3 - Full width for phone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone
                </label>
                {company.phone ? (
                  <div className="flex items-center space-x-1">
                    <p className="text-xs text-gray-900 py-1">
                      {company.phone}
                    </p>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-1 border-b border-dashed border-gray-300 cursor-pointer hover:text-gray-700">
                    Add Phone...
                  </p>
                )}
              </div>

              {/* Row 4 - Full width for address */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address
                </label>
                {company.address ? (
                  <p className="text-xs text-gray-900 py-1">
                    {company.address}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 py-1 border-b border-dashed border-gray-300 cursor-pointer hover:text-gray-700">
                    Add Address...
                  </p>
                )}
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Deals/Contacts Section */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('deals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'deals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
              >
                <div className="flex items-center">
                  <Handshake className="w-4 h-4 mr-2" />
                  Deals
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {company?.deals?.length || 0}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Contacts
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {company?.contacts?.length || 0}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'deals' ? (
            // Deals Tab Content
            <>
              {company.deals && company.deals.length > 0 ? (
                <div>
                  <table className="w-full table-fixed">
                    {/* Table Header */}
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-[30%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stage
                        </th>
                        <th className="w-[20%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="w-[20%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {company.deals.map((deal) => (
                        <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3">
                            <span className="text-xs font-medium text-gray-900 truncate">
                              {deal.title}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs font-semibold text-gray-900">
                              ${deal.value.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                              {deal.stage}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs text-gray-500">
                              {new Date(deal.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs text-gray-500">
                              {new Date(deal.updated_at).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Handshake className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No deals</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new deal for this company.
                  </p>
                </div>
              )}
            </>
          ) : (
            // Contacts Tab Content
            <>
              {company.contacts && company.contacts.length > 0 ? (
                <div>
                  <table className="w-full table-fixed">
                    {/* Table Header */}
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-[25%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="w-[25%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="w-[20%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {company.contacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-xs font-medium text-gray-900 truncate">
                                {contact.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {contact.email ? (
                              <span className="text-xs text-blue-600 hover:underline cursor-pointer truncate">
                                {contact.email}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {contact.phone ? (
                              <span className="text-xs text-gray-900 truncate">
                                {contact.phone}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {contact.position ? (
                              <span className="text-xs text-gray-900 truncate">
                                {contact.position}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs text-gray-500">
                              {new Date(contact.created_at).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new contact for this company.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;