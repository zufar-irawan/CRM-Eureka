"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Filter,
  Download,
  Users,
  Target,
  TrendingUp,
  Activity,
  CheckCircle,
  X,
  RotateCcw,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { checkAuthStatus } from "../../../utils/auth";

interface SalesData {
  id: string;
  sales_name: string;
  kanvasing_count: number;
  followup_count: number;
  penawaran_count: number;
  kesepakatan_tarif_count: number;
  deal_do_count: number;
  status_kpi: "Terpenuhi" | "Tidak Terpenuhi";
  date?: string;
  month?: number;
  year?: number;
  bulan: string;
  tanggal?: string;
}

interface FilterState {
  startDate: string;
  endDate: string;
  salesName: string;
  viewType: "BULANAN" | "HARIAN";
  monthYear: string;
}

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  },
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(config => {
  if (config.method === 'get') {
    const separator = config.url?.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}_t=${Date.now()}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default function ReportsPage() {
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

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    startDate: "",
    endDate: "",
    salesName: "",
    viewType: "BULANAN",
    monthYear: "",
  });

  useEffect(() => {
    fetchReportsData();
  }, [filters.viewType]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      console.log('Fetching KPI data with filters:', filters);

      const params: any = {
        view_type: filters.viewType,
      };

      if (filters.viewType === "BULANAN") {
        if (filters.monthYear) {
          const [year, month] = filters.monthYear.split('-').map(Number);
          params.year = year;
          params.month = month;
        } else {
          const currentDate = new Date();
          params.year = currentDate.getFullYear();
          params.month = currentDate.getMonth() + 1;
        }
      } else { // HARIAN
        if (filters.startDate) {
          params.start_date = filters.startDate;
        }
        if (filters.endDate) {
          params.end_date = filters.endDate;
        }
      }

      if (filters.salesName) {
        params.sales_name = filters.salesName;
      }

      console.log('API Parameters:', params);

      const endpoint = filters.viewType === 'BULANAN' ? '/kpi/monthly' : '/kpi/daily';
      const response = await api.get(endpoint, { params });
      console.log('API Response:', response.data);

      if (response.data.success) {
        const transformedData = response.data.data.map((item: any) => ({
          ...item,
          nama_sales: item.sales_name,
          bulan: item.month && item.year ? `${new Date(item.year, item.month - 1).toLocaleString('default', { month: 'long' })} ${item.year}` : '',
          tanggal: item.date ? new Date(item.date).toLocaleDateString('id-ID') : '',
        }));
        setSalesData(transformedData);
        console.log(`Loaded ${response.data.data.length} KPI records`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (error: any) {
      console.error('Error fetching KPI data:', error);

      // Show user-friendly error message
      let errorMessage = 'Failed to fetch KPI data';
      if (error.response?.status === 404) {
        errorMessage = 'KPI endpoint not found. Please check API configuration.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please check if the API is running.';
      }

      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: errorMessage,
        footer: `<small>API URL: ${api.defaults.baseURL}</small>`
      });
    } finally {
      setLoading(false);
    }
  };



  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    await fetchReportsData();
  };

  const handleFilterApply = async () => {
    console.log('Applying filters:', filters);
    setShowFilterDropdown(false);
    await fetchReportsData();
  };

  const handleFilterReset = async () => {
    console.log('Resetting filters');
    setFilters({
      startDate: "",
      endDate: "",
      salesName: "",
      viewType: "BULANAN",
      monthYear: "",
    });
    setShowFilterDropdown(false);
  };

  const handleViewTypeChange = (newViewType: "BULANAN" | "HARIAN") => {
    console.log(`Changing view type to: ${newViewType}`);
    setFilters(prev => ({
      ...prev,
      viewType: newViewType,
      startDate: "",
      endDate: "",
      monthYear: ""
    }));
  };

  const getKPIBadge = (status: string) => {
    if (status === "Terpenuhi") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <div className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0"></div>
          Terpenuhi
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></div>
          Tidak Terpenuhi
        </span>
      );
    }
  };

  const exportToCSV = () => {
    if (salesData.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "No data available to export",
      });
      return;
    }

    const headers = [
      filters.viewType === "BULANAN" ? "Bulan" : "Tanggal",
      "Nama Sales",
      "KANVASING task",
      "FOLLOWUP task",
      "DATABASE PENAWARAN task",
      "KESEPAKATAN TARIF task",
      "DEAL DO task",
      `Status KPI ${filters.viewType === "BULANAN" ? "Bulanan" : "Harian"}`,
    ];

    const csvContent = [
      headers.join(","),
      ...salesData.map((row) =>
        [
          filters.viewType === "BULANAN" ? `"${row.bulan}"` : `"${row.tanggal}"`,
          `"${row.sales_name}"`,
          row.kanvasing_count,
          row.followup_count,
          row.penawaran_count,
          row.kesepakatan_tarif_count,
          row.deal_do_count,
          `"${row.status_kpi}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales-report-${filters.viewType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: "Export Successful",
      text: "Report has been exported to CSV",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const calculateSummaryStats = () => {
    return {
      totalSales: salesData.length,
      kpiTerpenuhi: salesData.filter(d => d.status_kpi === "Terpenuhi").length,
      totalKanvasing: salesData.reduce((sum, d) => sum + d.kanvasing_count, 0),
      totalDeals: salesData.reduce((sum, d) => sum + d.deal_do_count, 0),
    };
  };

  const stats = calculateSummaryStats();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".filter-dropdown")) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <main className="p-4 overflow-visible lg:p-6 bg-white pb-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="z-40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Filter className="w-3 h-3" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute z-50 mt-12 w-80 bg-white border border-gray-200 rounded-md shadow-lg filter-dropdown">
                <div className="border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">View Type</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, viewType: "BULANAN" }))}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${filters.viewType === "BULANAN"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      BULANAN
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, viewType: "HARIAN" }))}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${filters.viewType === "HARIAN"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      HARIAN
                    </button>
                  </div>
                </div>

                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Date Range</p>
                  <div className="space-y-2">
                    {filters.viewType === "BULANAN" ? (
                      <input
                        type="month"
                        placeholder="Select month"
                        value={filters.monthYear}
                        onChange={(e) => setFilters(prev => ({ ...prev, monthYear: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <>
                        <input
                          type="date"
                          placeholder="Start Date"
                          value={filters.startDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          placeholder="End Date"
                          value={filters.endDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Sales Name</p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by sales name"
                      value={filters.salesName}
                      onChange={(e) => setFilters(prev => ({ ...prev, salesName: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {filters.salesName && (
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, salesName: "" }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 bg-white p-0.5 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={handleFilterApply}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={handleFilterReset}
                    className="px-3 py-2 text-sm text-red-500 hover:underline"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
              disabled={salesData.length === 0}
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => handleViewTypeChange("BULANAN")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filters.viewType === "BULANAN"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              BULANAN
            </button>
            <button
              onClick={() => handleViewTypeChange("HARIAN")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filters.viewType === "HARIAN"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              HARIAN
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-xl font-semibold text-gray-900">{stats.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">KPI Terpenuhi</p>
                <p className="text-xl font-semibold text-gray-900">{stats.kpiTerpenuhi}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Kanvasing</p>
                <p className="text-xl font-semibold text-gray-900">{stats.totalKanvasing}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
                <p className="text-xl font-semibold text-gray-900">{stats.totalDeals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full relative">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {filters.viewType === "BULANAN" ? "Bulan" : "Tanggal"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Sales
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kanvasing Task
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Followup Task
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penawaran Task
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kesepakatan Tarif
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal DO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status KPI
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8">
                    <div className="flex items-center justify-center">
                      <Activity className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-gray-500">Loading KPI data...</span>
                    </div>
                  </td>
                </tr>
              ) : salesData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-gray-500 text-center">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-lg font-medium">No KPI data available</p>
                      <p className="text-sm">Try adjusting your filters or check if tasks are completed</p>
                    </div>
                  </td>
                </tr>
              ) : (
                salesData.map((row, index) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-center font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">
                        {filters.viewType === "BULANAN" ? row.bulan : row.tanggal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{row.sales_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {row.kanvasing_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {row.followup_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {row.penawaran_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {row.kesepakatan_tarif_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {row.deal_do_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getKPIBadge(row.status_kpi)}
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
            <div className="flex items-center justify-center py-8">
              <Activity className="w-5 h-5 animate-spin mr-2" />
              <span className="text-gray-500">Loading KPI data...</span>
            </div>
          ) : salesData.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">No KPI data available</p>
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            salesData.map((row) => (
              <div key={row.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{row.sales_name}</h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {filters.viewType === "BULANAN" ? row.bulan : row.tanggal}
                      </div>
                    </div>
                  </div>
                  {getKPIBadge(row.status_kpi)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-gray-600 text-xs">Kanvasing</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {row.kanvasing_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600 text-xs">Followup</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {row.followup_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600 text-xs">Penawaran</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        {row.penawaran_count}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-gray-600 text-xs">Kesepakatan</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {row.kesepakatan_tarif_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600 text-xs">Deal DO</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        {row.deal_do_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{salesData.length}</span> of{" "}
            <span className="font-medium">{salesData.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={true}
            >
              Previous
            </button>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              1
            </button>
            <button
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={true}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}