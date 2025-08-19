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

const ContactDetailPage = () => {
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

  const params = useParams();
  const contactId = params.id;
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div>Contact not found</div>
      </div>
    );
  }

  const nameParts = contact.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Contact Details */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen">
        {/* Contact Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {firstName} {lastName}
              </h1>
              {contact.company && (
                <p className="text-gray-600 flex items-center mt-0.5 text-sm">
                  <Building2 className="w-3 h-3 mr-1" />
                  {contact.company.name}
                </p>
              )}
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
              {/* Row 1 - 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <p className="text-xs text-gray-900 py-1">
                    {firstName}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <p className="text-xs text-gray-900 py-1">
                    {lastName}
                  </p>
                </div>
              </div>

              {/* Row 2 - Full width for email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                {contact.email ? (
                  <p className="text-xs text-blue-600 py-1 hover:underline cursor-pointer break-all">
                    {contact.email}
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
                {contact.phone ? (
                  <div className="flex items-center space-x-1">
                    <p className="text-xs text-gray-900 py-1">
                      {contact.phone}
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

              {/* Row 4 - Full width for position */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Position
                </label>
                {contact.position ? (
                  <p className="text-xs text-gray-900 py-1">
                    {contact.position}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 py-1 border-b border-dashed border-gray-300 cursor-pointer hover:text-gray-700">
                    Add Position...
                  </p>
                )}
              </div>

              {/* Row 5 - Full width for company */}
              {contact.company && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <p className="text-xs text-gray-900 py-1">
                    {contact.company.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Deals Section */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                Deals
                <span className="ml-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {contact.deals?.length || 0}
                </span>
              </h2>
            </div>
          </div>

          {/* Table */}
          {contact.deals && contact.deals.length > 0 ? (
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
                  {contact.deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3">
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {deal.title}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-semibold text-gray-900">
                          {deal.value.toLocaleString()}
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
                Get started by creating a new deal for this contact.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetailPage;