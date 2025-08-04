"use client";

import { useState } from "react";
import {
  RotateCcw,
  Filter,
  ArrowUpDown,
  Columns,
} from "lucide-react";
import EditLeadModal from "../leads/components/EditLeadModal";
import DesktopTable, { Column } from "@/components/ListTable/DesktopTable";
import MobileCards, { Field } from "@/components/ListTable/MobileCards";
import fetchData from "@/components/ListTable/Functions/FetchData";

const allColumns: Column[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  {
    key: "deals.title",
    label: "Deals",
    render: (_: any, row: any) => row.deals?.[0]?.title || "-"
  },
  {
    key: "company.name",
    label: "Company",
    render: (_: any, row: any) => row.company?.name || "-"
  },
  {
    key: "created_at",
    label: "Last Modified",
    render: (value) =>
      new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
];

const allFields: Field[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  {
    key: "deals.title",
    label: "Deals",
    render: (_: any, row: any) => row.deals?.[0]?.title || "-"
  },
  {
    key: "company.name",
    label: "Company",
    render: (_: any, row: any) => row.company?.name || "-"
  },
  {
    key: "created_at",
    label: "Last Modified",
    render: (value) =>
      new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
];


export default function CompaniesList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<any>(null);
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
  }

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
          </div>
        </div>

        <DesktopTable pathname="/contacts/" columns={allColumns} visibleColumns={visibleColumns} loading={loading} setLoading={setLoading} />

        <MobileCards pathname="/contacts/" fields={allFields} visibleFields={visibleColumns} />

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

        {currentLead && (
          <EditLeadModal
            lead={currentLead}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleSaveLead}
          />
        )}
      </div>
    </main>
  );
}