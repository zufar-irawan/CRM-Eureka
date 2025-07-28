"use client";

import { useEffect, useState } from "react";
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

export default function MainLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      // UPDATED: Add status=0 query parameter to only fetch unconverted leads
      const res = await fetch("http://localhost:5000/api/leads/?status=0", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await res.json();
      setLeads(data.leads);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk Delete Handler
  const handleBulkDelete = async (ids: string[]) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} lead(s)?`)) return;

    try {
      const deletePromises = ids.map(async (id) => {
        const response = await fetch(`http://localhost:5000/api/leads/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to delete lead ${id}`);
        }

        return response.json();
      });

      await Promise.all(deletePromises);

      // Remove deleted leads from state
      setLeads((prev) => prev.filter((lead) => !ids.includes(lead.id.toString())));
      setSelectedLeads([]);
      alert(`Successfully deleted ${ids.length} lead(s)`);
    } catch (err: any) {
      alert("Failed to delete leads: " + err.message);
    }
  };

  // Bulk Update Handler
  const handleBulkUpdate = async (ids: string[], field: string, value: string) => {
    try {
      const fieldMap: { [key: string]: string } = {
        "Owner": "owner",
        "Company": "company",
        "Title": "title",
        "First Name": "first_name",
        "Last Name": "last_name",
        "Job Position": "job_position",
        "Email": "email",
        "Phone": "phone",
        "Mobile": "mobile",
        "Fax": "fax",
        "Website": "website",
        "Industry": "industry",
        "Number Of Employees": "number_of_employees",
        "Lead Source": "lead_source",
        "Stage": "stage",
        "Rating": "rating",
        "Street": "street",
        "City": "city",
        "State": "state",
        "Postal Code": "postal_code",
        "Country": "country",
        "Description": "description"
      };

      const apiField = fieldMap[field] || field.toLowerCase().replace(/ /g, "_");

      const updatePromises = ids.map(async (id) => {
        const response = await fetch(`http://localhost:5000/api/leads/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [apiField]: value }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to update lead ${id}`);
        }

        return response.json();
      });

      await Promise.all(updatePromises);

      // Refresh leads after update
      await fetchLeads();
      setSelectedLeads([]);
      alert(`Successfully updated ${ids.length} lead(s)`);
    } catch (err: any) {
      alert("Failed to update leads: " + err.message);
    }
  };

  // UPDATED: Bulk Convert Handler - After successful conversion, leads will be filtered out automatically
  const handleBulkConvert = async (dealTitle: string, dealValue: number, dealStage: string) => {
    try {
      const convertPromises = selectedLeads.map(async (id) => {
        const response = await fetch(`http://localhost:5000/api/leads/${id}/convert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deal_title: dealTitle,
            deal_value: dealValue,
            deal_stage: dealStage
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to convert lead ${id}`);
        }

        return response.json();
      });

      await Promise.all(convertPromises);

      // UPDATED: After conversion, remove converted leads from current view since they now have status=1
      setLeads((prev) => prev.filter((lead) => !selectedLeads.includes(lead.id.toString())));
      setSelectedLeads([]);
      alert(`Successfully converted ${selectedLeads.length} lead(s) to deal(s)`);
    } catch (err: any) {
      alert("Failed to convert leads: " + err.message);
      throw err; // Re-throw to let the modal handle loading state
    }
  };

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
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchLeads}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {/* <span className="hidden sm:inline">Refresh</span> */}
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Filter className="w-3 h-3" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {/* SORT BUTTON + DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span className="hidden sm:inline">Sort</span>
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

            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Columns className="w-3 h-3" />
              <span className="hidden sm:inline">Columns</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
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
              ) : leads.length === 0 ? (
                <tr><td className="px-6 py-4 text-gray-500 text-center" colSpan={8}>No unconverted leads found</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id.toString())}
                      onChange={() => toggleSelectLead(lead.id.toString())}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="text-xs font-medium text-gray-900">{lead.title + " " + lead.fullname}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-900">{lead.company}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-blue-600 hover:underline cursor-pointer">{lead.email}</td>
                  <td className="px-6 py-4 text-xs text-gray-900">{lead.mobile}</td>
                  <td className="px-6 py-4 text- text-gray-500">
                    {new Date(lead.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center">
                    <button className="text-gray-400 hover:text-gray-600 mx-auto">
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
          ) : leads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No unconverted leads found</p>
          ) : leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id.toString())}
                    onChange={() => toggleSelectLead(lead.id.toString())}
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {lead.stage}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-blue-600">{lead.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {lead.mobile}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {new Date(lead.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{leads.length}</span> of{" "}
            <span className="font-medium">{leads.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
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