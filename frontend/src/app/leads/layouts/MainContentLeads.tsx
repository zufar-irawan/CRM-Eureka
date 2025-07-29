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
  Edit,
  Trash2,
} from "lucide-react";
import EditLeadModal from "../components/EditLeadModal";

// Delete Modal Component
interface DeleteLeadModalProps {
  selectedCount: number;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: () => void;
  type: "leads" | "deals";
}

function DeleteLeadModal({
  selectedCount,
  selectedIds,
  onClose,
  onConfirm,
  type,
}: DeleteLeadModalProps) {
  const itemType = type === "leads" ? "Lead" : "Deal";
  const itemTypePlural = type === "leads" ? "Leads" : "Deals";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-4">Delete {selectedCount > 1 ? itemTypePlural : itemType}</h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-sm text-gray-700 mb-6">
          {selectedCount === 1 ? (
            <>
              Are you sure you want to delete this {itemType.toLowerCase()}?
            </>
          ) : (
            <>
              Are you sure you want to delete <strong>{selectedCount}</strong> {itemTypePlural.toLowerCase()}?
            </>
          )}
        </p>

        {selectedCount <= 5 && (
          <div className="mb-4 text-xs text-gray-500">
            <p className="font-medium mb-1">Selected IDs:</p>
            <p className="break-all">{selectedIds.join(", ")}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default function MainLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const stages = [
    "new",
    "contacted",
    "qualification",
    "unqualified"
  ];
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadsToDelete, setLeadsToDelete] = useState<string[]>([]);

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

    const interval = setInterval(() => {
      fetchLeads();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedStage, searchTerm]);


  const fetchLeads = async (filters: {
    stage?: string | null
    search?: string
    sortBy?: string
    sortOrder?: "ASC" | "DESC"
  } = {}) => {
    try {
      setLoading(true);

      const response = await api.get("/leads/", {
        params: {
          status: 0,
          ...(filters.stage ? { stage: filters.stage } : {}),
          ...(filters.search ? { search: filters.search } : {}),
          ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
          ...(filters.sortOrder ? { sortOrder: filters.sortOrder } : {})
        }
      });

      setLeads(response.data.leads);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchLeads();
  };

  const handleEditLead = (lead: any) => {
    setCurrentLead(lead);
    setEditModalOpen(true);
    setActionMenuOpenId(null);
  };

  const handleSaveLead = (updatedLead: any) => {
    setLeads(prev => prev.map(lead =>
      lead.id === updatedLead.id ? updatedLead : lead
    ));
    setEditModalOpen(false);
  };

  const openDeleteModal = (ids: string[]) => {
    setLeadsToDelete(ids);
    setDeleteModalOpen(true);
    setActionMenuOpenId(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setLeadsToDelete([]);
  };

  const confirmDelete = async () => {
    await handleBulkDelete(leadsToDelete);
    closeDeleteModal();
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const deletePromises = ids.map(async (id) => {
        try {
          const response = await api.delete(`/leads/${id}`);
          return { success: true, id, data: response.data };
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || `Failed to delete lead ${id}`;
          return { success: false, id, error: errorMessage };
        }
      });

      const results = await Promise.allSettled(deletePromises);

      const successful: string[] = [];
      const failed: { id: string; error: string }[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const value = result.value;
          if (value.success) {
            successful.push(value.id);
          } else {
            failed.push({ id: value.id, error: value.error });
          }
        }
      });

      if (successful.length > 0) {
        setLeads((prev) => prev.filter((lead) => !successful.includes(lead.id.toString())));
        setSelectedLeads([]);
      }

      if (failed.length === 0) {
        alert(`Successfully deleted ${successful.length} lead(s)`);
      } else if (successful.length === 0) {
        alert(`Failed to delete all leads: ${failed.map(f => f.error).join(', ')}`);
      } else {
        alert(`Partially successful: ${successful.length} deleted, ${failed.length} failed`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete leads";
      alert("Failed to delete leads: " + errorMessage);
      console.error("Bulk delete error:", err);
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id)
        ? prev.filter((leadId) => leadId !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(".sort-dropdown") &&
        !target.closest(".action-menu") &&
        !target.closest("[data-action-menu]")) {
        setShowSortDropdown(false);
        setActionMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Function to get stage badge color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New':
        return 'bg-gray-100 text-gray-800';
      case 'Contacted':
        return 'bg-blue-100 text-blue-800';
      case 'Qualification':
        return 'bg-yellow-100 text-yellow-800';
      case 'Converted':
        return 'bg-green-100 text-green-800';
      case 'Unqualified':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="p-4 overflow-visible lg:p-6 bg-white pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Filter className="w-3 h-3" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute z-50 mt-12 w-72 bg-white border border-gray-200 rounded-md shadow-lg">
                {/* Stage Filter */}
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Stage</p>
                  <ul className="max-h-40 overflow-y-auto space-y-1">
                    {stages.map((stage) => (
                      <li
                        key={stage}
                        onClick={() => setSelectedStage(stage)}
                        className={`text-sm px-2 py-1 rounded cursor-pointer ${selectedStage === stage
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100"
                          }`}
                      >
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Owner Filter */}
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Owner</p>
                  <div className="relative mt-2">
                    <input
                      type="text"
                      placeholder="Search by owner"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-200 rounded text-sm focus:outline-none"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 bg-white p-0.5 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedStage(null);
                      setSearchTerm("");
                    }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>

              </div>
            )}

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
                          if (sortBy === option.toLowerCase().replace(/ /g, "_")) {
                            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
                          } else {
                            setSortBy(option.toLowerCase().replace(/ /g, "_"));
                            setSortOrder("ASC");
                          }
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
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full relative">
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
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(lead.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="relative" data-action-menu>
                        <button
                          className="text-gray-400 hover:text-gray-600 mx-auto p-1 rounded-full hover:bg-gray-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpenId(lead.id.toString() === actionMenuOpenId ? null : lead.id.toString())
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {actionMenuOpenId === lead.id.toString() && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpenId(null);
                              }}
                            />

                            <div className={`absolute right-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden action-menu ${leads.indexOf(lead) >= leads.length - 2
                                ? 'bottom-full mb-1'
                                : 'top-full mt-1'
                              }`}>
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditLead(lead);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal([lead.id.toString()]);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
                    {lead.stage}
                  </span>

                  <div className="relative" data-action-menu>
                    <button
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuOpenId(lead.id.toString() === actionMenuOpenId ? null : lead.id.toString())
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {actionMenuOpenId === lead.id.toString() && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpenId(null);
                          }}
                        />

                        <div className={`absolute right-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden action-menu ${leads.indexOf(lead) >= leads.length - 2
                            ? 'bottom-full mb-1'
                            : 'top-full mt-1'
                          }`}>
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLead(lead);
                              }}
                              className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal([lead.id.toString()]);
                              }}
                              className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
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

        {/* Edit Lead Modal */}
        {currentLead && (
          <EditLeadModal
            lead={currentLead}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleSaveLead}
          />
        )}

        {/* Delete Lead Modal */}
        {deleteModalOpen && (
          <DeleteLeadModal
            selectedCount={leadsToDelete.length}
            selectedIds={leadsToDelete}
            onClose={closeDeleteModal}
            onConfirm={confirmDelete}
            type="leads"
          />
        )}
      </div>
    </main>
  );
}