"use client";

import { useState } from "react";
import { RefreshCw, Filter, ArrowUpDown, MoreHorizontal } from "lucide-react";

// Sample contacts data based on your image
const contactsData = [
  {
    id: 1,
    email: "zufar@gmail.com",
    phone: "093928",
    organization: "orens",
    lastModified: "25 minutes ago",
    status: "Active"
  },
  {
    id: 2,
    email: "pajri@gmail.com",
    phone: "083993933",
    organization: "solution",
    lastModified: "2 hours ago",
    status: "Active"
  },
  {
    id: 3,
    email: "rionkenzo@gmail.com",
    phone: "081829382",
    organization: "",
    lastModified: "yesterday",
    status: "Inactive"
  },
  {
    id: 4,
    email: "gheaananda1107@gmail...",
    phone: "",
    organization: "",
    lastModified: "3 days ago",
    status: "Active"
  }
];

export default function MainContacts() {
  const [contacts, setContacts] = useState(contactsData);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState("Status");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(contacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: number, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId]);
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    }
  };

  const isAllSelected = selectedContacts.length === contacts.length;
  const isIndeterminate = selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  return (
    <div className="flex-1 p-6 overflow-auto bg-gray-50">
      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <span className="text-gray-700">{statusFilter}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isStatusDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setStatusFilter("Status");
                    setIsStatusDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  All Status
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("Active");
                    setIsStatusDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  Active
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("Inactive");
                    setIsStatusDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  Inactive
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <RefreshCw size={18} />
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800">
          <Filter size={18} />
          <span>Filter</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800">
          <ArrowUpDown size={18} />
          <span>Sort</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
          <span>Columns</span>
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-900">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-900">Phone</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-900">Organization</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-900">Last Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{contact.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {contact.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {contact.organization && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-600">{contact.organization.charAt(0).toUpperCase()}</span>
                        </div>
                        {contact.organization}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{contact.lastModified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">20</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">50</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">100</button>
          </div>
          <div className="text-sm text-gray-500">
            4 of 4
          </div>
        </div>
      </div>
    </div>
  );
}