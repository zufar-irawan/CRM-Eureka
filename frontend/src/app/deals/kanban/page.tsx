"use client";

import { v4 as uuidv4 } from 'uuid';
import fetchKanbanData from "@/components/Kanban/Functions/FetchKanbanData";
import Kanban, { DNDType } from "@/components/Kanban/Kanban"
import { Filter, KanbanIcon, RotateCcw, Search, X } from "lucide-react"
import { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { usePathname } from 'next/navigation';

export default function DealsKanban() {
    const [data, setData] = useState<any[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const pathname = usePathname();
    const [containers, setContainers] = useState<DNDType[]>([
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'proposal',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'negotiation',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-green-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'won',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>,
            title: 'lost',
            items: []
        },
    ]);

    const [showFilterDropdown, setShowFilterDropdown] = useState(false)

    const filterOptions = [
        { value: 'title', label: 'Title' },
        { value: 'fullname', label: 'Fullname' },
    ]
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [filterOption, setFilterOption] = useState<string>('')

    const fetchDataWithFilter = useCallback(() => {
        console.log('Fetching data with filter:', { filterOption, searchTerm }); // Debug log
        fetchKanbanData({
            url: "http://localhost:5000/api/deals",
            setData: setData,
            setContainers: setContainers,
            groupBy: "stage",
            groupBy: "stage",
            mapItem: (deal) => ({
                id: `item-${deal.id}`,
                itemId: deal.id,
                fullname: deal.lead?.fullname || "Unknown",
                organization: deal.lead?.company || "-",
                email: deal.lead?.email || "-",
                mobileno: deal.lead?.phone || "-",
            }),
            filterBy: filterOption,
            searchTerm: searchTerm
        })
    }, [filterOption, searchTerm])

    const handleRefresh = () => {
        fetchDataWithFilter()
    }

    // Initial data fetch
    useEffect(() => {
        fetchDataWithFilter()
    }, [fetchDataWithFilter]);

    // Filter effect - PERBAIKAN: Memanggil fungsi fetchDataWithFilter()
    useEffect(() => {
        if (filterOption && searchTerm) {
            console.log('Filter changed, refetching...'); // Debug log
            fetchDataWithFilter(); // TAMBAHKAN () untuk memanggil fungsi
        } else if (!filterOption && !searchTerm) {
            // Fetch all data when no filter
            fetchDataWithFilter();
        }
    }, [filterOption, searchTerm, fetchDataWithFilter])

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        console.log('Filter option changed:', value); // Debug log
        setFilterOption(value)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        console.log('Search term changed:', value); // Debug log
        setSearchTerm(value)
    }

    const handleClearFilters = () => {
        console.log('Clearing filters'); // Debug log
        setFilterOption("");
        setSearchTerm("");
        setShowFilterDropdown(false);
    }

    const handleApplyFilter = () => {
        console.log('Applying filter manually'); // Debug log
        fetchDataWithFilter();
        setShowFilterDropdown(false);
    }

    const hasActiveFilters = filterOption || searchTerm;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

            <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-50'} flex flex-col`}>
                <Header
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    setIsModalOpen={setIsModalOpen}
                    pathname={pathname}
                />

                <main className="flex-1 p-4 overflow-auto lg:p-6 bg-white">
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

                                {/* Active Filter Indicator */}
                                {hasActiveFilters && (
                                    <div className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        <span>
                                            {filterOption && `${filterOptions.find(opt => opt.value === filterOption)?.label}`}
                                            {filterOption && searchTerm && ': '}
                                            {searchTerm && `"${searchTerm}"`}
                                        </span>
                                        <button
                                            onClick={handleClearFilters}
                                            className="ml-1 hover:bg-blue-200 rounded p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Kanban setContainers={setContainers} setData={setData} containers={containers} pathname='Deals' />
                </main>
            </div>
        </div>
    );
}