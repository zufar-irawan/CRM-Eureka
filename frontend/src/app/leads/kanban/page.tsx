"use client"

import { v4 as uuidv4 } from 'uuid'
import fetchKanbanData from "@/components/Kanban/Functions/FetchKanbanData"
import Kanban, { DNDType } from "@/components/Kanban/Kanban"
import { Filter, KanbanIcon, RotateCcw, X, Search } from "lucide-react"
import { useEffect, useState, useCallback } from 'react'
import { setStyle } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { checkAuthStatus } from "../../../../utils/auth";

export default function LeadsKanban() {
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

    const [data, setData] = useState<any[]>([])
    const [containers, setContainers] = useState<DNDType[]>([
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'New',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'Contacted',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-red-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'Qualification',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'Converted',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'Unqualified',
            items: []
        },
    ])
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)

    const filterOptions = [
        { value: 'fullname', label: 'Full Name' },
        { value: 'email', label: 'Email' },
        { value: 'company', label: 'Company' },
        { value: 'phone', label: 'Phone Number' }
    ]
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [filterOption, setFilterOption] = useState<string>('')

    // Fungsi untuk fetch data dengan filter
    const fetchDataWithFilter = useCallback(() => {
        fetchKanbanData({
            url: "http://localhost:5000/api/leads",
            setData: setData,
            setContainers: setContainers,
            groupBy: "stage",
            mapItem: (lead) => ({
                id: `item-${lead.id}`,
                itemId: lead.id,
                fullname: lead.fullname || "Unknown",
                organization: lead.company || "-",
                email: lead.email || "-",
                mobileno: lead.phone || "-",
            }),
            filterBy: filterOption,
            searchTerm: searchTerm
        })
    }, [filterOption, searchTerm])

    const handleRefresh = () => {
        fetchDataWithFilter();
    }

    // Fetch data saat component mount
    useEffect(() => {
        fetchDataWithFilter();
    }, []);

    // Re-fetch data ketika filter berubah
    useEffect(() => {
        if (filterOption || searchTerm) {
            fetchDataWithFilter();
        }
    }, [filterOption, searchTerm, fetchDataWithFilter]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        setFilterOption(value)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const handleClearFilters = () => {
        setFilterOption("");
        setSearchTerm("");
        setShowFilterDropdown(false);
    }

    const handleApplyFilter = () => {
        fetchDataWithFilter();
        setShowFilterDropdown(false);
    }

    // Check if filters are active
    const hasActiveFilters = filterOption || searchTerm;

    return (
        <main className="p-4 overflow-auto lg:p-6 bg-white">
            <div className="mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center gap-2 px-2.5 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                            title="Refresh data"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className={`flex items-center gap-2 px-3 py-2 text-xs border rounded-md transition-colors ${hasActiveFilters
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <Filter className="w-3 h-3" />
                                <span className="hidden sm:inline">
                                    Filter {hasActiveFilters && `(${filterOption ? 1 : 0}${searchTerm ? '+search' : ''})`}
                                </span>
                            </button>

                            {showFilterDropdown && (
                                <div className="absolute z-50 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg">
                                    {/* Filter By Section */}
                                    <div className="border-b border-gray-100 px-4 py-3">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Filter by</p>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                                            onChange={handleFilterChange}
                                            value={filterOption}
                                        >
                                            <option value="">Select field to filter</option>
                                            {filterOptions.map((option, index) => (
                                                <option key={index} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Search Term Section */}
                                    <div className="px-4 py-3">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Search term</p>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Enter search term..."
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500"
                                                disabled={!filterOption}
                                            />
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                        {!filterOption && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Please select a field to filter first
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                                        <button
                                            onClick={handleClearFilters}
                                            className="text-sm text-red-500 hover:underline"
                                            disabled={!hasActiveFilters}
                                        >
                                            Clear Filters
                                        </button>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowFilterDropdown(false)}
                                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleApplyFilter}
                                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                                disabled={!filterOption || !searchTerm}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Kanban setContainers={setContainers} setData={setData} containers={containers} pathname='Leads' />
        </main>
    )
}