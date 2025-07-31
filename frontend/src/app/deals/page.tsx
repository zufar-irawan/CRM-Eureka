"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import SelectedActionBar from "@/app/leads/components/SelectedActionBar";

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

export default function MainContentDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);

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
        return 'bg-gray-100 text-gray-800 border-gray-200'; // Default untuk status lain
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

const fetchDeals = async () => {
  try {
    setLoading(true);
    const res = await fetch("/api/deals");
    const result = await res.json();

    if (!result.success) throw new Error(result.message);

    console.log('[DEBUG] Raw deals data:', result.data); // Debug log

    const formattedDeals = result.data.map((deal: any) => {
      // Debug setiap deal
      console.log('[DEBUG] Processing deal:', {
        id: deal.id,
        value: deal.value,
        valueType: typeof deal.value,
        rawDeal: deal
      });

      // Pastikan value dikonversi dengan benar
      let annualRevenue = "$0.00";
      if (deal.value !== null && deal.value !== undefined && deal.value !== '') {
        const numValue = parseFloat(deal.value.toString());
        if (!isNaN(numValue) && numValue > 0) {
          annualRevenue = `$${numValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`;
        }
      }

      console.log('[DEBUG] Formatted annual revenue:', annualRevenue);

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

    console.log('[DEBUG] Final formatted deals:', formattedDeals);
    setDeals(formattedDeals);
  } catch (err: any) {
    console.error('[ERROR] Failed to load deals:', err);
    alert("Failed to load deals: " + err.message);
  } finally {
    setLoading(false);
  }
};

  // Bulk Delete Handler
  const handleBulkDelete = async (ids: string[]) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} deal(s)?`)) return;

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

      // Remove deleted deals from state
      setDeals((prev) => prev.filter((deal) => !ids.includes(deal.id)));
      setSelectedDeals([]);
      alert(`Successfully deleted ${ids.length} deal(s)`);
    } catch (err: any) {
      alert("Failed to delete deals: " + err.message);
    }
  };

  // Bulk Update Handler
  const handleBulkUpdate = async (ids: string[], field: string, value: string) => {
    try {
      const fieldMap: { [key: string]: string } = {
        "Title": "title",
        "Value": "value",
        "Stage": "stage",
        "Owner": "owner"
      };

      const apiField = fieldMap[field] || field.toLowerCase().replace(/ /g, "_");

      const updatePromises = ids.map(async (id) => {
        const response = await fetch(`/api/deals/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [apiField]: value }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to update deal ${id}`);
        }

        return response.json();
      });

      await Promise.all(updatePromises);

      // Refresh deals after update
      await fetchDeals();
      setSelectedDeals([]);
      alert(`Successfully updated ${ids.length} deal(s)`);
    } catch (err: any) {
      alert("Failed to update deals: " + err.message);
    }
  };

  const toggleSelectDeal = (id: string) => {
    setSelectedDeals((prev) =>
      prev.includes(id)
        ? prev.filter((dealId) => dealId !== id)
        : [...prev, id]
    );
  };

  const isAllSelected =
    deals.length > 0 && selectedDeals.length === deals.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDeals([]);
    } else {
      setSelectedDeals(deals.map((deal) => deal.id));
    }
  };

  return (
    <main className="p-4 overflow-auto lg:p-6 bg-white pb-6">
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
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Filter className="w-3 h-3" />
              <span className="hidden sm:inline">Filter</span>
            </button>
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
              ) : (
                deals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDeals.includes(deal.id)}
                        onChange={() => toggleSelectDeal(deal.id)}
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
                        <DollarSign className="w-3.5 h-3.5 text-green-500" />
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
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600 mx-auto">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
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
          ) : (
            deals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDeals.includes(deal.id)}
                      onChange={() => toggleSelectDeal(deal.id)}
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(deal.status)}`}>
                      {deal.status}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
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

        {/* Action bar */}
        <SelectedActionBar
          selectedCount={selectedDeals.length}
          selectedIds={selectedDeals}
          onClearSelection={() => setSelectedDeals([])}
          onDelete={handleBulkDelete}
          onUpdate={handleBulkUpdate}
          type="deals"
        />
      </div>
    </main>
  );
}