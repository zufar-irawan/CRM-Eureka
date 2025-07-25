"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  RotateCcw,
  Filter,
  ArrowUpDown,
  Columns,
  MoreHorizontal,
  Phone,
  Mail,
  User,
  Building2,
  X,
} from "lucide-react";
import SelectedActionBar from "../components/SelectedActionBar";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging (optional)
api.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.url);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Response error:", error);

    if (error.code === 'ECONNABORTED') {
      console.error("Request timeout");
    } else if (error.response) {
      // Server responded with error status
      console.error("Server error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network error - no response received");
    }

    return Promise.reject(error);
  }
);

export default function MainLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const sortOptions = [
    "Owner", "Company", "Title", "First Name", "Last Name", "Fullname",
    "Job Position", "Email", "Phone", "Mobile", "Fax", "Website",
    "Industry", "Number Of Employees", "Lead Source", "Stage",
    "Rating", "Street", "City", "State", "Postal Code", "Country",
    "Description"
  ];

  const filteredSortOptions = sortOptions.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/leads/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

        if (!res.ok) {
          throw new Error("Gagal mengambil data leads");
        }

        const data = await res.json();
        setLeads(data.leads);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const toggleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id)
        ? prev.filter((leadId) => leadId !== id)
        : [...prev, id]
    );
  };

  const isAllSelected =
    leads.length > 0 && selectedLeads.length === leads.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((lead) => lead.id.toString()));
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".sort-dropdown")) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <main className="p-4 overflow-auto lg:p-6 bg-white pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={refreshData}
                className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={fetchLeads}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Filter className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">Filter</span>
            </button>

            {/* SORT BUTTON + DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span className="hidden sm:inline text-xs ">Sort</span>
              </button>

              {showSortDropdown && (
                <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg sort-dropdown">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border-b border-gray-100 text-sm focus:outline-none"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 bg-white p-0.5 rounded z-20 pointer-events-auto"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {filteredSortOptions.map((option) => (
                      <li
                        key={option}
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          console.log("Sort by:", option);
                          setShowSortDropdown(false);
                          setSearchTerm("");
                        }}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Columns className="w-3 h-3" />
              <span className="hidden sm:inline">Columns</span>
            </button>

            <button className="flex items-center gap-2 px-2.5 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    disabled={loading || leads.length === 0}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td className="px-6 py-4" colSpan={8}>Loading...</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleSelectLead(lead.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{lead.fullname}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{lead.company}</td>
                  <td className="px-6 py-4">{lead.stage}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{lead.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{lead.mobile}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{lead.updated_at}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <p className="text-2xl">Loading...</p>
          ) : leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => toggleSelectLead(lead.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{lead.fullname}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Building2 className="w-3 h-3 mr-1" />
                      {lead.company}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lead.stage}
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {lead.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {lead.mobile}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">{lead.updated_at}</span>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{leads.length}</span> of{" "}
            <span className="font-medium">{leads.length}</span> results
            Showing <span className="font-medium">1</span> to <span className="font-medium">{leads.length}</span> of{" "}
            <span className="font-medium">{leads.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-2 text-sm bg-slate-800 text-white rounded-md hover:bg-slate-700">
              1
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>

        <SelectedActionBar
          selectedCount={selectedLeads.length}
          selectedIds={selectedLeads}
          onClearSelection={() => setSelectedLeads([])}
          onDelete={handleBulkDelete}
          onUpdate={handleBulkUpdate}
          onConvert={handleBulkConvert}
          type="leads"
        />
      </div>
    </main>
  );
}