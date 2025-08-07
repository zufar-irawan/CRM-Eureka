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

export default function TasksList() {
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
  const categories = ['Kanvasing', 'Followup', 'Penawaran', 'Lainnya'];
  const priorities = ['low', 'medium', 'high'];

  const openModal = useTaskModalStore((state) => state.openModal)

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
          columns={allColumns}
          visibleColumns={visibleColumns}
          loading={loading}
          setLoading={setLoading}
          onEdit={(row) => openModal(row)}
          selectedStatus={selectedStatus}
          selectedCategory={selectedCategory}
          selectedPriority={selectedPriority}
          searchTerm={searchTerm}
        />

        <MobileCards pathname="/tasks/" fields={allFields} visibleFields={visibleColumns} />

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