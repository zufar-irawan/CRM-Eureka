"use client";

import { useEffect, useState } from "react";
import {
  RotateCcw,
  Filter,
  Columns,
  X,
} from "lucide-react";
import EditLeadModal from "../leads/components/EditLeadModal";
import DesktopTable, { Column } from "@/components/ListTable/DesktopTable";
import MobileCards, { Field } from "@/components/ListTable/MobileCards";
import fetchData from "@/components/ListTable/Functions/FetchData";
import EditTasksModal from "./edit/editModal";
import { useTaskModalStore } from "@/Store/taskModalStore";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { checkAuthStatus } from "../../../utils/auth";

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

export default function TasksList() {
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

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<any>(null);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const status = ["new", "pending", "completed", "overdue", "cancelled"];
  const categories = ['Kanvasing', 'Followup', 'Penawaran', 'Kesepakatan Tarif', 'Deal DO', 'Lainnya'];
  const priorities = ['low', 'medium', 'high'];

  const openModal = useTaskModalStore((state) => state.openModal)

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.map(col => col.key)
  )

  const [visiblieFields, setVisibleFields] = useState<string[]>(
    allFields.map(col => col.key)
  )

  // Fungsi untuk mendapatkan warna status yang sesuai dengan kanban
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'new':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const renderStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    let dotColor = '';

    switch (normalizedStatus) {
      case 'new':
        dotColor = 'bg-gray-700';
        break;
      case 'pending':
        dotColor = 'bg-blue-600';
        break;
      case 'completed':
        dotColor = 'bg-green-700';
        break;
      case 'overdue':
        dotColor = 'bg-red-600';
        break;
      case 'cancelled':
        dotColor = 'bg-red-600';
        break;
      default:
        dotColor = 'bg-gray-700';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        <div className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`}></div>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Fungsi untuk render badge priority
  const renderPriorityBadge = (priority: string) => {
    const normalizedPriority = priority.toLowerCase();
    let colorClass = '';

    switch (normalizedPriority) {
      case 'low':
        colorClass = 'bg-green-100 text-green-800 border border-green-200';
        break;
      case 'medium':
        colorClass = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        break;
      case 'high':
        colorClass = 'bg-red-100 text-red-800 border border-red-200';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800 border border-gray-200';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

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
      setData, setLoading, url: "/tasks/", selectedStatus, searchTerm
    });
  }

  const handleSaveLead = (updatedLead: any) => {
    setData(prev => prev.map(lead =>
      lead.id === updatedLead.id ? updatedLead : lead
    ));
    setEditModalOpen(false);
  }

  useEffect(() => {
    const fetchFilteredData = async () => {
      await fetchData({
        setData,
        setLoading,
        url: "/tasks/",
        selectedStatus,
        selectedCategory,
        selectedPriority,
        searchTerm
      });
    };

    fetchFilteredData();
  }, [selectedStatus, selectedCategory, selectedPriority, searchTerm]); // Dependency array untuk memantau perubahan filter

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

              {showFilterDropdown && (
                <div className="absolute z-50 mt-2 w-120 bg-white border border-gray-200 rounded-md shadow-lg">

                  <div className="grid grid-cols-3">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Status</p>
                      <ul className="max-h-40 overflow-y-auto space-y-1">
                        {status.map((stage) => (
                          <li
                            key={stage}
                            onClick={() => setSelectedStatus(stage)}
                            className={`text-sm px-2 py-1 rounded cursor-pointer ${selectedStatus === stage
                              ? "bg-blue-100 text-blue-700"
                              : "hover:bg-gray-100"
                              }`}
                          >
                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Category</p>
                      <ul className="max-h-40 overflow-y-auto space-y-1">
                        {categories.map((stage) => (
                          <li
                            key={stage}
                            onClick={() => setSelectedCategory(stage)}
                            className={`text-sm px-2 py-1 rounded cursor-pointer ${selectedCategory === stage
                              ? "bg-blue-100 text-blue-700"
                              : "hover:bg-gray-100"
                              }`}
                          >
                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Priority</p>
                      <ul className="max-h-40 overflow-y-auto space-y-1">
                        {priorities.map((stage) => (
                          <li
                            key={stage}
                            onClick={() => setSelectedPriority(stage)}
                            className={`text-sm px-2 py-1 rounded cursor-pointer ${selectedPriority === stage
                              ? "bg-blue-100 text-blue-700"
                              : "hover:bg-gray-100"
                              }`}
                          >
                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Search</p>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        placeholder="Search Tasks by Title and Category"
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
                        setSelectedStatus(null);
                        setSelectedPriority(null);
                        setSelectedCategory(null);
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

          </div>
        </div>

        <DesktopTable
          pathname="/tasks/"
          columns={allColumns.map(col => ({
            ...col,
            render: col.key === 'status' ? (value) => renderStatusBadge(value) :
              col.key === 'priority' ? (value) => renderPriorityBadge(value) :
                col.render
          }))}
          visibleColumns={visibleColumns}
          loading={loading}
          setLoading={setLoading}
          onEdit={(row) => openModal(row)}
          selectedStatus={selectedStatus}
          selectedCategory={selectedCategory}
          selectedPriority={selectedPriority}
          searchTerm={searchTerm}
        />

        <MobileCards
          pathname="/tasks/"
          fields={allFields.map(field => ({
            ...field,
            render: field.key === 'status' ? (value) => renderStatusBadge(value) :
              field.key === 'priority' ? (value) => renderPriorityBadge(value) :
                field.render
          }))}
          visibleFields={visibleColumns}
        />

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
      </div>
    </main>
  );
}