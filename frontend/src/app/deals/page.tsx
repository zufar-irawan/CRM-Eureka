"use client";

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MainContentDeals from './Layouts/MainContentDeals';
import { usePathname } from 'next/navigation';

export default function DealsPage() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

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
                          placeholder="Search deals"
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
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
              <table className="w-full table-auto">
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
                    deals.map((deal, index) => (
                      <tr
                        key={deal.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(deal.id)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedDeals.includes(deal.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectDeal(deal.id);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>

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
                        <input
                          type="checkbox"
                          checked={selectedDeals.includes(deal.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelectDeal(deal.id);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {deal.organization}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <DollarSign className="w-3 h-3" />
                            {deal.annualRevenue}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`}>
                          {deal.status}
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
                        <span className="text-blue-600">{deal.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {deal.mobile}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {deal.assignedTo}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {deal.updated_at}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{deals.length}</span> of{" "}
                <span className="font-medium">{deals.length}</span> results
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