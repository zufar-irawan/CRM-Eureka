"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  RotateCcw,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
import EditLeadModal from "./components/EditLeadModal";
import Swal from "sweetalert2";

interface DeleteLeadModalProps {
  selectedCount: number;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: () => void;
  type: "leads" | "deals";
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
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

// Define all available columns
const ALL_COLUMNS = {
  name: { key: 'name', label: 'Name', default: true, sortable: true },
  company: { key: 'company', label: 'Organization', default: true, sortable: true },
  stage: { key: 'stage', label: 'Status', default: true, sortable: true },
  email: { key: 'email', label: 'Email', default: true, sortable: true },
  mobile: { key: 'mobile', label: 'Mobile No', default: true, sortable: true },
  updated_at: { key: 'updated_at', label: 'Last Modified', default: true, sortable: true },
  owner: { key: 'owner', label: 'Owner', default: false, sortable: true },
  title: { key: 'title', label: 'Title', default: false, sortable: true },
  first_name: { key: 'first_name', label: 'First Name', default: false, sortable: true },
  last_name: { key: 'last_name', label: 'Last Name', default: false, sortable: true },
  job_position: { key: 'job_position', label: 'Job Position', default: false, sortable: true },
  work_email: { key: 'work_email', label: 'Work Email', default: false, sortable: true },
  phone: { key: 'phone', label: 'Phone', default: false, sortable: true },
  fax: { key: 'fax', label: 'Fax', default: false, sortable: false },
  website: { key: 'website', label: 'Website', default: false, sortable: true },
  industry: { key: 'industry', label: 'Industry', default: false, sortable: true },
  number_of_employees: { key: 'number_of_employees', label: 'Number of Employees', default: false, sortable: true },
  lead_source: { key: 'lead_source', label: 'Lead Source', default: false, sortable: true },
  rating: { key: 'rating', label: 'Rating', default: false, sortable: true },
  street: { key: 'street', label: 'Street', default: false, sortable: false },
  city: { key: 'city', label: 'City', default: false, sortable: true },
  state: { key: 'state', label: 'State', default: false, sortable: true },
  postal_code: { key: 'postal_code', label: 'Postal Code', default: false, sortable: false },
  country: { key: 'country', label: 'Country', default: false, sortable: true },
  description: { key: 'description', label: 'Description', default: false, sortable: false },
  created_at: { key: 'created_at', label: 'Created At', default: false, sortable: true },
} as const;

export default function MainLeads() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [originalLeads, setOriginalLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadsToDelete, setLeadsToDelete] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Initialize visible columns with defaults
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    return Object.entries(ALL_COLUMNS)
      .filter(([_, column]) => column.default)
      .map(([key, _]) => key);
  });

  const stages = ["new", "contacted", "qualification", "unqualified"];

  useEffect(() => {
    fetchLeads()

    const refreshLeads = () => {
      fetchLeads()
    }

    window.addEventListener("lead-created", refreshLeads)

    return () => {
      window.removeEventListener("lead-created", refreshLeads)
    }
  }, [selectedStage, searchTerm]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get("/leads/", {
        params: {
          status: 0,
          ...(selectedStage ? { stage: selectedStage } : {}),
          ...(searchTerm ? { search: searchTerm } : {}),
        }
      });
      setOriginalLeads(response.data.leads);
      setLeads(response.data.leads);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sorting function - now with 3-state toggle: none -> asc -> desc -> none
  const handleSort = (columnKey: string) => {
    const column = ALL_COLUMNS[columnKey as keyof typeof ALL_COLUMNS];
    if (!column?.sortable) return;

    let newSortConfig: SortConfig | null = null;

    if (!sortConfig || sortConfig.key !== columnKey) {
      // First click: set to ascending
      newSortConfig = { key: columnKey, direction: 'asc' };
    } else if (sortConfig.direction === 'asc') {
      // Second click: set to descending
      newSortConfig = { key: columnKey, direction: 'desc' };
    } else {
      // Third click: clear sorting (back to original order)
      newSortConfig = null;
    }

    setSortConfig(newSortConfig);

    if (newSortConfig) {
      const sortedLeads = [...leads].sort((a, b) => {
        let aValue = a[columnKey];
        let bValue = b[columnKey];

        // Handle special cases
        if (columnKey === 'name') {
          aValue = (a.title + " " + a.fullname).toLowerCase();
          bValue = (b.title + " " + b.fullname).toLowerCase();
        } else if (columnKey === 'updated_at' || columnKey === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (columnKey === 'number_of_employees' || columnKey === 'rating') {
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
        } else {
          // Handle null/undefined values
          aValue = aValue?.toString().toLowerCase() || '';
          bValue = bValue?.toString().toLowerCase() || '';
        }

        if (aValue < bValue) {
          return newSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return newSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });

      setLeads(sortedLeads);
    } else {
      // Reset to original order
      setLeads([...originalLeads]);
    }
  };

  // Update leads when originalLeads changes (after fetch)
  useEffect(() => {
    if (sortConfig) {
      handleSort(sortConfig.key);
    } else {
      setLeads([...originalLeads]);
    }
  }, [originalLeads]);

  const getSortIcon = (columnKey: string) => {
    const column = ALL_COLUMNS[columnKey as keyof typeof ALL_COLUMNS];
    if (!column?.sortable) return null;

    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }

    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  const handleRowClick = (leadId: string) => {
    router.push(`/leads/detail/${leadId}`);
  };

  const handleRefresh = async () => {
    await fetchLeads();
  };

  const handleEditLead = (lead: any) => {
    setCurrentLead(lead);
    setEditModalOpen(true);
    setActionMenuOpenId(null);
  }

  const handleSaveLead = (updatedLead: any) => {
    setLeads(prev => prev.map(lead =>
      lead.id === updatedLead.id ? updatedLead : lead
    ));
    setOriginalLeads(prev => prev.map(lead =>
      lead.id === updatedLead.id ? updatedLead : lead
    ));
    setEditModalOpen(false);
  };

  const openDeleteModal = (ids: string[]) => {
    setLeadsToDelete(ids);
    setDeleteModalOpen(true);
    setActionMenuOpenId(null);
  }

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
          const errorMessage =
            error.response?.data?.message || error.message || `Failed to delete lead ${id}`;
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
        setOriginalLeads((prev) => prev.filter((lead) => !successful.includes(lead.id.toString())));
        setSelectedLeads([]);
      }

      if (failed.length === 0) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: `Successfully deleted ${successful.length} lead(s).`,
        });
      } else if (successful.length === 0) {
        await Swal.fire({
          icon: 'error',
          title: 'Failed',
          html: `<p>Failed to delete all leads:</p><ul>${failed
            .map((f) => `<li>${f.error}</li>`)
            .join('')}</ul>`,
        });
      } else {
        await Swal.fire({
          icon: 'warning',
          title: 'Partial Success',
          html: `<p>${successful.length} deleted, ${failed.length} failed.</p><ul>${failed
            .map((f) => `<li>${f.error}</li>`)
            .join('')}</ul>`,
        });
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to delete leads';
      console.error('Bulk delete error:', err);

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to delete leads: ${errorMessage}`,
      });
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id)
        ? prev.filter((leadId) => leadId !== id)
        : [...prev, id]
    );
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnKey)) {
        // Don't allow hiding all columns
        if (prev.length <= 1) return prev;
        return prev.filter(key => key !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };

  const resetColumnsToDefault = () => {
    const defaultColumns = Object.entries(ALL_COLUMNS)
      .filter(([_, column]) => column.default)
      .map(([key, _]) => key);
    setVisibleColumns(defaultColumns);
  };

  const selectAllColumns = () => {
    setVisibleColumns(Object.keys(ALL_COLUMNS));
  };

  const deselectAllColumns = () => {
    // Keep at least one column visible
    setVisibleColumns(['name']);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(".action-menu") &&
        !target.closest(".columns-dropdown") &&
        !target.closest("[data-action-menu]") &&
        !target.closest("[data-columns-menu]")) {
        setShowColumnsDropdown(false);
        setActionMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAllSelected = leads.length > 0 && selectedLeads.length === leads.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((lead) => lead.id.toString()));
    }
  };

  const getStageColor = (stage: string) => {
    const normalizedStage = stage.toLowerCase();
    switch (normalizedStage) {
      case 'new':
        return 'bg-gray-100 text-gray-700';
      case 'contacted':
        return 'bg-blue-100 text-blue-700';
      case 'qualification':
        return 'bg-red-100 text-red-700';
      case 'unqualified':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderCellContent = (lead: any, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <User className="w-3 h-3 text-blue-600" />
            </div>
            <div className="text-xs font-medium text-gray-900">{lead.title + " " + lead.fullname}</div>
          </div>
        );
      case 'company':
        return <span className="text-xs text-gray-900">{lead.company || '-'}</span>;
      case 'stage':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
            {lead.stage}
          </span>
        );
      case 'email':
        return <span className="text-xs text-blue-600 hover:underline">{lead.email || '-'}</span>;
      case 'mobile':
        return <span className="text-xs text-gray-900">{lead.mobile || '-'}</span>;
      case 'updated_at':
        return (
          <span className="text-xs text-gray-500">
            {new Date(lead.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        );
      case 'created_at':
        return (
          <span className="text-xs text-gray-500">
            {new Date(lead.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        );
      case 'owner':
        return <span className="text-xs text-gray-900">{lead.owner || '-'}</span>;
      case 'title':
        return <span className="text-xs text-gray-900">{lead.title || '-'}</span>;
      case 'first_name':
        return <span className="text-xs text-gray-900">{lead.first_name || '-'}</span>;
      case 'last_name':
        return <span className="text-xs text-gray-900">{lead.last_name || '-'}</span>;
      case 'job_position':
        return <span className="text-xs text-gray-900">{lead.job_position || '-'}</span>;
      case 'work_email':
        return <span className="text-xs text-blue-600">{lead.work_email || '-'}</span>;
      case 'phone':
        return <span className="text-xs text-gray-900">{lead.phone || '-'}</span>;
      case 'fax':
        return <span className="text-xs text-gray-900">{lead.fax || '-'}</span>;
      case 'website':
        return <span className="text-xs text-blue-600">{lead.website || '-'}</span>;
      case 'industry':
        return <span className="text-xs text-gray-900">{lead.industry || '-'}</span>;
      case 'number_of_employees':
        return <span className="text-xs text-gray-900">{lead.number_of_employees || '-'}</span>;
      case 'lead_source':
        return <span className="text-xs text-gray-900">{lead.lead_source || '-'}</span>;
      case 'rating':
        return <span className="text-xs text-gray-900">{lead.rating || '-'}</span>;
      case 'street':
        return <span className="text-xs text-gray-900">{lead.street || '-'}</span>;
      case 'city':
        return <span className="text-xs text-gray-900">{lead.city || '-'}</span>;
      case 'state':
        return <span className="text-xs text-gray-900">{lead.state || '-'}</span>;
      case 'postal_code':
        return <span className="text-xs text-gray-900">{lead.postal_code || '-'}</span>;
      case 'country':
        return <span className="text-xs text-gray-900">{lead.country || '-'}</span>;
      case 'description':
        return (
          <span className="text-xs text-gray-900 truncate max-w-xs" title={lead.description}>
            {lead.description || '-'}
          </span>
        );
      default:
        return <span className="text-xs text-gray-900">-</span>;
    }
  };

  return (
    <main className="p-4 overflow-visible lg:p-6 bg-white pb-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="z-40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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

            <div className="relative" data-columns-menu>
              <button
                onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
              >
                <Columns className="w-3 h-3" />
                <span className="hidden sm:inline">Columns</span>
              </button>

              {showColumnsDropdown && (
                <div className="absolute z-50 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg columns-dropdown">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700">Show Columns</h3>
                      <span className="text-xs text-gray-500">{visibleColumns.length} selected</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllColumns}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-xs text-gray-400">|</span>
                      <button
                        onClick={deselectAllColumns}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Clear
                      </button>
                      <span className="text-xs text-gray-400">|</span>
                      <button
                        onClick={resetColumnsToDefault}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {Object.entries(ALL_COLUMNS).map(([key, column]) => (
                      <div
                        key={key}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleColumnVisibility(key)}
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(key)}
                          onChange={() => toggleColumnVisibility(key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm text-gray-700">{column.label}</span>
                        {column.default && (
                          <span className="ml-auto text-xs text-blue-600 font-medium">Default</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden z-40 lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full relative">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left sticky left-0 bg-gray-50 z-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {visibleColumns.map((columnKey) => {
                  const column = ALL_COLUMNS[columnKey as keyof typeof ALL_COLUMNS];
                  return (
                    <th
                      key={columnKey}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap group ${column?.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors select-none' : ''
                        }`}
                      onClick={() => column?.sortable && handleSort(columnKey)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column?.label}</span>
                        {column?.sortable && (
                          <div className="flex items-center">
                            {getSortIcon(columnKey)}
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-4" colSpan={visibleColumns.length + 2}>Loading...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-gray-500 text-center" colSpan={visibleColumns.length + 2}>
                    No unconverted leads found
                  </td>
                </tr>
              ) : leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(lead.id)}
                >
                  <td className="px-6 py-4 sticky left-0 bg-white z-10" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id.toString())}
                      onChange={() => toggleSelectLead(lead.id.toString())}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {visibleColumns.map((columnKey) => (
                    <td key={columnKey} className="px-6 py-4 whitespace-nowrap">
                      {renderCellContent(lead, columnKey)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm text-gray-500 sticky right-0 bg-white z-10" onClick={(e) => e.stopPropagation()}>
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
          <div
            key={lead.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer"
            onClick={() => handleRowClick(lead.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedLeads.includes(lead.id.toString())}
                  onChange={() => toggleSelectLead(lead.id.toString())}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                  onClick={(e) => e.stopPropagation()}
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

                <div className="relative" data-action-menu onClick={(e) => e.stopPropagation()}>
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
          {sortConfig && (
            <span className="ml-2 text-xs text-blue-600">
              (sorted by {ALL_COLUMNS[sortConfig.key as keyof typeof ALL_COLUMNS]?.label} {sortConfig.direction === 'asc' ? '↑' : '↓'})
            </span>
          )}
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
    </main >
  );
}