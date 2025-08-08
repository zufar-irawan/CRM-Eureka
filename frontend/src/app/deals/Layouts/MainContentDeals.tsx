"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import Swal from "sweetalert2";

interface Deal {
  id: string;
  organization: string;
  annualRevenue: string;
  status: string;
  email: string;
  mobile: string;
  assignedTo: string;
  updated_at: string;
  rawData: any;
}

interface DeleteDealModalProps {
  selectedCount: number;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: () => void;
  type: "deals";
}

function DeleteDealModal({
  selectedCount,
  selectedIds,
  onClose,
  onConfirm,
  type,
}: DeleteDealModalProps) {
  const itemType = "Deal";
  const itemTypePlural = "Deals";

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

export default function Deals() {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dealsToDelete, setDealsToDelete] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const stages = ["proposal", "negotiation", "won", "lost"];

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase().trim();

    switch (normalizedStatus) {
      case 'proposal':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'negotiation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(".action-menu") &&
        !target.closest("[data-action-menu]")) {
        setActionMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/deals");
      const result = await res.json();

      if (!result.success) throw new Error(result.message);

      const formattedDeals = result.data.map((deal: any) => {
        let annualRevenue = "0.00";
        if (deal.value !== null && deal.value !== undefined && deal.value !== '') {
          const numValue = parseFloat(deal.value.toString());
          if (!isNaN(numValue) && numValue > 0) {
            annualRevenue = numValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          }
        }

        return {
          id: String(deal.id),
          organization: deal.lead?.company || deal.company || "N/A",
          annualRevenue: annualRevenue,
          status: deal.stage || "N/A",
          email: deal.lead?.email || deal.email || "-",
          mobile: deal.lead?.phone || deal.lead?.mobile || deal.mobile || "-",
          assignedTo: deal.creator?.name || deal.owner || "Unassigned",
          updated_at: new Date(deal.updated_at).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
          }),
          rawData: deal
        };
      });

      setDeals(formattedDeals);
    } catch (err: any) {
      console.error('[ERROR] Failed to load deals:', err);

      Swal.fire({
        icon: "error",
        title: 'Failed',
        text: "Failed to load deals: " + err.message
      })

    } finally {
      setLoading(false);
    }
  };

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
        icon: "success",
        title: "Success",
        text: `Successfully deleted ${ids.length} deal(s)`
      })

    } catch (err: any) {

      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: "Failed to delete deals: " + err.message
      })

    }
  };

  const handleEditDeal = (deal: any) => {
    // You can implement edit functionality here
    console.log("Edit deal:", deal);
    setActionMenuOpenId(null);
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

  return (
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

            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <ArrowUpDown className="w-3 h-3" />
              <span className="hidden sm:inline">Sort</span>
            </button>
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
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-4" colSpan={9}>
                    Loading...
                  </td>
                </tr>
              ) : deals.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-gray-500 text-center" colSpan={9}>
                    No deals found
                  </td>
                </tr>
              ) : (
                deals.map((deal) => (
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

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Building2 className="w-3 h-3 text-green-600" />
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {deal.organization}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-900">
                      <div className="flex items-center">
                        {/*<DollarSign className="w-3.5 h-3.5 text-green-500" />*/}
                        {deal.annualRevenue}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-blue-600 hover:underline cursor-pointer">
                      {deal.email}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-900">
                      {deal.mobile}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-gray-600">
                            {deal.assignedTo.charAt(0)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-900">
                          {deal.assignedTo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {deal.updated_at}
                    </td>
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
                        {/*<DollarSign className="w-3 h-3" />*/}
                        {deal.annualRevenue}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(deal.status)}`}>
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

        {/* Delete Deal Modal */}
        {deleteModalOpen && (
          <DeleteDealModal
            selectedCount={dealsToDelete.length}
            selectedIds={dealsToDelete}
            onClose={closeDeleteModal}
            onConfirm={confirmDelete}
            type="deals"
          />
        )}
      </div>
    </div>
  );
}