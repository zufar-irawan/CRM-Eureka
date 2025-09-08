"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  DollarSign,
  X,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import DeleteDealModal from "./components/DeleteDealModal";
import EditDealModal from "./components/EditDealModal";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CreateDealsModal from "./add/AddDealsModal";
import Swal from "sweetalert2";
import { useDealEditStore } from "@/Store/dealModalStore";
import axios from "axios";
import { checkAuthStatus } from "../../../utils/auth";
import useUser from "../../../hooks/useUser";

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const ALL_COLUMNS = {
  title: { key: 'title', label: 'Title', default: true, sortable: true },
  value: { key: 'value', label: 'Value', default: true, sortable: false },
  stage: { key: 'stage', label: 'Stage', default: true, sortable: true },

  // Lead-related (from lead object)
  lead_fullname: { key: 'lead.fullname', label: 'Lead Name', default: true, sortable: true },
  lead_email: { key: 'lead.email', label: 'Lead Email', default: false, sortable: true },
  lead_phone: { key: 'lead.phone', label: 'Lead Phone', default: false, sortable: true },

  // Contact-related (from contact object)
  contact_name: { key: 'contact.name', label: 'Contact Name', default: false, sortable: true },
  contact_email: { key: 'contact.email', label: 'Contact Email', default: false, sortable: true },
  contact_phone: { key: 'contact.phone', label: 'Contact Phone', default: false, sortable: true },
  contact_position: { key: 'contact.position', label: 'Contact Position', default: false, sortable: true },
  contact_company: { key: 'contact.company.name', label: 'Contact Company', default: false, sortable: true },

  // Company-related (from company object)
  company_name: { key: 'company.name', label: 'Company Name', default: true, sortable: true },
  company_phone: { key: 'company.phone', label: 'Company Phone', default: false, sortable: true },
  company_address: { key: 'company.address', label: 'Company Address', default: false, sortable: false },

  // Creator-related
  owner: { key: 'owner', label: 'Owner ID', default: false, sortable: true },
  created_by: { key: 'created_by', label: 'Created By ID', default: false, sortable: true },
  creator_name: { key: 'creator.name', label: 'Creator Name', default: false, sortable: true },
  creator_email: { key: 'creator.email', label: 'Creator Email', default: false, sortable: true },

  // Timestamps
  created_at: { key: 'created_at', label: 'Created At', default: false, sortable: false },
  updated_at: { key: 'updated_at', label: 'Updated At', default: true, sortable: false },
} as const;

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// Helper function to get stage colors (matching leads style)
const getStageColor = (stage: string) => {
  const normalizedStage = stage.toLowerCase();
  switch (normalizedStage) {
    case 'proposal':
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    case 'negotiation':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'won':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'lost':
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

// Function to render stage badge with dot indicator (matching leads style)
const renderStageBadge = (stage: string) => {
  const normalizedStage = stage.toLowerCase();
  let dotColor = '';

  switch (normalizedStage) {
    case 'proposal':
      dotColor = 'bg-gray-700';
      break;
    case 'negotiation':
      dotColor = 'bg-blue-600';
      break;
    case 'won':
      dotColor = 'bg-green-600';
      break;
    case 'lost':
      dotColor = 'bg-red-600';
      break;
    default:
      dotColor = 'bg-gray-700';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(stage)}`}>
      <div className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`}></div>
      {stage.charAt(0).toUpperCase() + stage.slice(1)}
    </span>
  );
};

export default function Deals() {
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

  const pathname = usePathname();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dealsToDelete, setDealsToDelete] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [originalLeads, setOriginalLeads] = useState<any[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)
  const openEditModal = useDealEditStore((state) => state.openModal)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [paginatedDeals, setPaginatedDeals] = useState<any[]>([]);

  // Hitung total halaman
  const totalPages = Math.ceil(deals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, deals.length);

  const stages = ["proposal", "negotiation", "won", "lost"];

  const { user } = useUser()

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    return Object.entries(ALL_COLUMNS)
      .filter(([_, column]) => column.default)
      .map(([key, _]) => key);
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(".action-menu") &&
        !target.closest("[data-action-menu]")) {
        setActionMenuOpenId(null);
      }
    }

    if (user?.isSales) {
      fetchDealsForSales()
    } else {
      fetchDeals();
    }


    const handleRefresh = () => {
      fetchDeals()
    }

    window.addEventListener("deals-add", handleRefresh)

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("deals-add", handleRefresh)
    };
  }, [selectedStage, debouncedSearch]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/deals/", {
        params: {
          ...(selectedStage ? { stage: selectedStage } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        }
      })

      setOriginalLeads(response.data.data)
      setDeals(response.data.data)
    } catch (err: any) {
      console.error('[ERROR] Failed to load deals:', err);

      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: "Failed to load deals: " + err.message
      })
    } finally {
      setLoading(false);
    }
  };

  const fetchDealsForSales = async () => {
    try {
      setLoading(true);
      const response = await api.get("/deals/", {
        params: {
          ...(selectedStage ? { stage: selectedStage } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...(user?.id ? { owner: user?.id } : {})
        }
      })

      setOriginalLeads(response.data.data)
      setDeals(response.data.data)
    } catch (err: any) {
      console.error('[ERROR] Failed to load deals:', err);

      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: "Failed to load deals: " + err.message
      })
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setPaginatedDeals(deals.slice(start, end));
  }, [deals, currentPage]);

  const handleRowClick = (id: string) => {
    router.push(`/deals/detail/${id}`);
  };

  const openDeleteModal = (ids: string[]) => {
    setDealsToDelete(ids);
    setDeleteModalOpen(true);
    setActionMenuOpenId(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDealsToDelete([]);
  };

  const confirmDelete = async () => {
    await handleBulkDelete(dealsToDelete);
    closeDeleteModal();
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const deletePromises = ids.map(async (id) => {
        const response = await fetch(`/api/deals/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to delete deal ${id}`);
        }

        return response.json();
      });

      await Promise.all(deletePromises);
      setDeals((prev) => prev.filter((deal) => !ids.includes(deal.id)));
      setSelectedDeals([]);
      Swal.fire({
        icon: 'success',
        title: "Success",
        text: `Successfully deleted ${ids.length} deal(s)`
      })
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: "Failed",
        text: "Failed to delete deals: " + err.message
      })
    }
  };

  const handleEditDeal = (deal: any) => {
    setCurrentDeal(deal);
    setEditModalOpen(true);
    setActionMenuOpenId(null);
  };

  const handleSaveDeal = (updatedDeal: any) => {
    setDeals(prev => prev.map(deal =>
      deal.id === updatedDeal.id ? updatedDeal : deal
    ));
    setEditModalOpen(false);
  };

  const toggleSelectDeal = (id: string) => {
    setSelectedDeals((prev) =>
      prev.includes(id)
        ? prev.filter((dealId) => dealId !== id)
        : [...prev, id]
    );
  };

  const isAllSelected = deals.length > 0 && selectedDeals.length === deals.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDeals([]);
    } else {
      setSelectedDeals(deals.map((deal) => deal.id));
    }
  };

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
      const sortedLeads = [...deals].sort((a, b) => {
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

      setDeals(sortedLeads);
    } else {
      // Reset to original order
      setDeals([...originalLeads]);
    }
  }

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

  const renderCellContent = (deal: any, columnKey: string) => {
    const getSafe = (path: string) => path.split('.').reduce((obj, key) => obj?.[key], deal) ?? '-';

    const getSafeWithFallback = (primary: string, fallback: string) => {
      const primaryValue = getSafe(primary);
      return primaryValue && primaryValue !== '-' ? primaryValue : getSafe(fallback);
    };


    switch (columnKey) {
      case 'title':
        return <span className="text-xs text-gray-900">{deal.title || '-'}</span>;

      case 'value':
        return (
          <span className="text-xs text-gray-900">
            {deal.value
              ? new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(Number(deal.value))
              : '-'}
          </span>
        );

      case 'stage':
        return renderStageBadge(deal.stage);

      // Lead fields
      case 'lead_fullname':
        return (
          <span className="text-xs text-gray-900">
            {getSafeWithFallback('lead.fullname', 'contact.name')}
          </span>
        );

      case 'lead_email':
        return (
          <span className="text-xs text-blue-600 hover:underline">
            {getSafeWithFallback('lead.email', 'contact.email')}
          </span>
        );

      case 'lead_phone':
        return (
          <span className="text-xs text-gray-900">
            {getSafeWithFallback('lead.phone', 'contact.phone')}
          </span>
        );


      // Contact fields
      case 'contact_name':
        return <span className="text-xs text-gray-900">{getSafe('contact.name')}</span>;
      case 'contact_email':
        return <span className="text-xs text-blue-600 hover:underline">{getSafe('contact.email')}</span>;
      case 'contact_phone':
        return <span className="text-xs text-gray-900">{getSafe('contact.phone')}</span>;
      case 'contact_position':
        return <span className="text-xs text-gray-900">{getSafe('contact.position')}</span>;
      case 'contact_company':
        return <span className="text-xs text-gray-900">{getSafe('contact.company.name')}</span>;

      // Company fields
      case 'company_name':
        return <span className="text-xs text-gray-900">{getSafe('company.name')}</span>;
      case 'company_phone':
        return <span className="text-xs text-gray-900">{getSafe('company.phone')}</span>;
      case 'company_address':
        return <span className="text-xs text-gray-900">{getSafe('company.address')}</span>;

      // Creator / owner
      case 'creator_name':
        return <span className="text-xs text-gray-900">{getSafe('creator.name')}</span>;
      case 'creator_email':
        return <span className="text-xs text-blue-600 hover:underline">{getSafe('creator.email')}</span>;
      case 'owner':
        return <span className="text-xs text-gray-900">{deal.owner || '-'}</span>;
      case 'created_by':
        return <span className="text-xs text-gray-900">{deal.created_by || '-'}</span>;

      // Timestamps
      case 'created_at':
        return (
          <span className="text-xs text-gray-500">
            {new Date(deal.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        );
      case 'updated_at':
        return (
          <span className="text-xs text-gray-500">
            {new Date(deal.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        );

      default:
        return <span className="text-xs text-gray-900">-</span>;
    }
  };


  const selectAllColumns = () => {
    setVisibleColumns(Object.keys(ALL_COLUMNS));
  };

  const deselectAllColumns = () => {
    // Keep at least one column visible
    setVisibleColumns(['name']);
  };

  const resetColumnsToDefault = () => {
    const defaultColumns = Object.entries(ALL_COLUMNS)
      .filter(([_, column]) => column.default)
      .map(([key, _]) => key);
    setVisibleColumns(defaultColumns);
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

  return (
    <div className="flex">
      <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

      {isModalOpen ? (
        <CreateDealsModal onClose={() => setIsModalOpen(false)} />
      ) : ''}

      <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-50'}`}>
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setIsModalOpen={setIsModalOpen}
          pathname={pathname}
        />

        <div className="p-4 overflow-auto lg:p-6 bg-white pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fetchDeals}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>

                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                >
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
                      <p className="text-sm font-semibold text-gray-700 mb-1">Search</p>
                      <div className="relative mt-2">
                        <input
                          type="text"
                          placeholder="Search deals by title & code"
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
                          setShowFilterDropdown(false);
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
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
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

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td className="px-6 py-4" colSpan={visibleColumns.length + 2}>Loading...</td>
                    </tr>
                  ) : deals.length === 0 ? (
                    <tr>
                      <td className="px-6 py-4 text-gray-500 text-center" colSpan={9}>
                        No deals found
                      </td>
                    </tr>
                  ) : (
                    paginatedDeals.map((deal, index) => (
                      <tr
                        key={deal.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(deal.id)}
                      >
                        <td className="px-6 py-4 text-sm text-center">{index + 1}</td>

                        {visibleColumns.map((columnKey) => (
                          <td key={columnKey} className="px-6 py-4 whitespace-nowrap">
                            {renderCellContent(deal, columnKey)}
                          </td>
                        ))}

                        <td className="px-6 py-4 text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                          <div className="relative" data-action-menu>
                            <button
                              className="text-gray-400 hover:text-gray-600 mx-auto p-1 rounded-full hover:bg-gray-100 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpenId(deal.id === actionMenuOpenId ? null : deal.id);
                              }}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {actionMenuOpenId === deal.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionMenuOpenId(null);
                                  }}
                                />

                                <div className={`absolute right-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden action-menu ${deals.indexOf(deal) >= deals.length - 2
                                  ? 'bottom-full mb-1'
                                  : 'top-full mt-1'
                                  }`}>
                                  <div className="py-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(deal.id);
                                        setActionMenuOpenId(null)
                                      }}
                                      className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteModal([deal.id]);
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {loading ? (
                <p className="text-2xl">Loading...</p>
              ) : deals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No deals found</p>
              ) : (
                deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer"
                    onClick={() => handleRowClick(deal.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {deal.title || deal.organization}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {deal.value ? new Intl.NumberFormat('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(Number(deal.value)) : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(deal.stage)}`}>
                          <div className={`w-2 h-2 rounded-full ${deal.stage === 'proposal' ? 'bg-gray-700' : deal.stage === 'negotiation' ? 'bg-blue-600' : deal.stage === 'won' ? 'bg-green-600' : 'bg-red-600'} flex-shrink-0`}></div>
                          {deal.stage}
                        </span>

                        <div className="relative" data-action-menu onClick={(e) => e.stopPropagation()}>
                          <button
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpenId(deal.id === actionMenuOpenId ? null : deal.id);
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {actionMenuOpenId === deal.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenuOpenId(null);
                                }}
                              />

                              <div className={`absolute right-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden action-menu ${deals.indexOf(deal) >= deals.length - 2
                                ? 'bottom-full mb-1'
                                : 'top-full mt-1'
                                }`}>
                                <div className="py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditDeal(deal);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteModal([deal.id]);
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
                        <span className="text-blue-600">{deal.lead?.email || deal.email || '-'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {deal.lead?.phone || deal.mobile || '-'}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {deal.lead?.fullname || deal.assignedTo || '-'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date(deal.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{deals.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm rounded-md ${currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>

            </div>

            {/* Edit Deal Modal */}
            <EditDealModal />

            {/* Delete Deal Modal */}
            {deleteModalOpen && (
              <DeleteDealModal
                selectedCount={dealsToDelete.length}
                selectedIds={dealsToDelete}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}