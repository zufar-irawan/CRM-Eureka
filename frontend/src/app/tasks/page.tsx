"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  User2Icon,
} from "lucide-react";
import EditLeadModal from "../leads/components/EditLeadModal";
import DesktopTable, { Column } from "@/components/ListTable/DesktopTable";
import MobileCards, { Field } from "@/components/ListTable/MobileCards";
import fetchData from "@/components/ListTable/Functions/FetchData";

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

const allColumns: Column[] = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description" },
  { key: "category", label: "Category" },
  {
    key: "due_date",
    label: "Due Date",
    render: (value) =>
      new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
  },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  // { key: "assigned_to", label: "Assigned To" },
  {
    key: "updated_at",
    label: "Last Modified",
    render: (value) =>
      new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
  },
]

const allFields: Field[] = [
  { key: "description", label: "Description" },
  { key: "category", label: "Category" },
  {
    key: "due_date",
    label: "Due Date",
    render: (value: string) => new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  },
  // { key: "status", label: "Status" },
  // { key: "priority", label: "Priority" },
  // { key: "assigned_to", label: "Assigned To" },
  {
    key: "created_at",
    label: "Created At",
    render: (value: string) => new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  },
  {
    key: "updated_at",
    label: "Last Modified",
    render: (value: string) => new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  },
]


const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

export default function TasksList() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadsToDelete, setDataToDelete] = useState<string[]>([])
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.map(col => col.key)
  )

  const [visiblieFields, setVisibleFields] = useState<string[]>(
    allFields.map(col => col.key)
  )

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )

    setVisibleFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleRefresh = async () => {
    await fetchData({
      setData, setLoading, url: "/tasks/"
    });
  }

  const handleSaveLead = (updatedLead: any) => {
    setData(prev => prev.map(lead =>
      lead.id === updatedLead.id ? updatedLead : lead
    ));
    setEditModalOpen(false);
  };

  const openDeleteModal = (ids: string[]) => {
    setDataToDelete(ids);
    setDeleteModalOpen(true);
    setActionMenuOpenId(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDataToDelete([]);
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
        setData((prev) => prev.filter((lead) => !successful.includes(lead.id.toString())));
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

  const isAllSelected = data.length > 0 && selectedLeads.length === data.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(data.map((lead) => lead.id.toString()));
    }
  }

  const getStageColor = (stage: string) => {
    const normalizedStage = stage.toLowerCase();
    switch (normalizedStage) {
      case 'low':
        return 'text-gray-700';
      case 'medium':
        return 'text-yellow-700';
      case 'high':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <main className="p-4 overflow-visible lg:p-6 bg-white pb-6 relative">
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

            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-3 h-3" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span className="hidden sm:inline">Sort</span>
              </button>
            </div>

            <div className="relative">
              <button onClick={() => setShowColumnDropdown(!showColumnDropdown)} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                <Columns className="w-3 h-3" />
                <span className="hidden sm:inline">Columns</span>
              </button>

              {showColumnDropdown && (
                <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded shadow z-50">

                  <div className="hidden lg:block py-2 px-3 max-h-64 overflow-y-auto">
                    {allColumns.map(col => (
                      <label key={col.key} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col.key)}
                          onChange={() => toggleColumn(col.key)}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm">{col.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="block lg:hidden py-2 px-3 max-h-64 overflow-y-auto">
                    {allFields.map(col => (
                      <label key={col.key} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col.key)}
                          onChange={() => toggleColumn(col.key)}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm">{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <MoreHorizontal className="w-3 h-3" />
            </button> */}
          </div>
        </div>

        <DesktopTable pathname="/tasks/" columns={allColumns} visibleColumns={visibleColumns} loading={loading} setLoading={setLoading} />

        {/* Mobile Cards */}
        <MobileCards pathname="/tasks/" fields={allFields} visibleFields={visibleColumns} />

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{data.length}</span> of{" "}
            <span className="font-medium">{data.length}</span> results
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