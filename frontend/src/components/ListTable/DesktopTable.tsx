"use client";

import { useEffect, useState } from "react";
import fetchData from "./Functions/FetchData";
import deleteData from "./Functions/DeleteData";
import {
  Edit,
  MoreHorizontal,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean; // Optional: untuk mengontrol kolom mana yang bisa di-sort
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

function getNestedValue(obj: any, path: string): any {
  return path
    .replace(/\[(\d+)\]/g, ".$1") // ubah [0] jadi .0
    .split(".")
    .reduce((acc, key) => acc?.[key], obj);
}

function sortData(data: any[], sortConfig: SortConfig): any[] {
  if (!sortConfig) return data;

  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortConfig.key);
    const bValue = getNestedValue(b, sortConfig.key);

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Handle dates
    if (sortConfig.key.includes("date") || sortConfig.key.includes("_at")) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      return sortConfig.direction === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    // Handle numbers
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle strings (case insensitive)
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    if (aString < bString) return sortConfig.direction === "asc" ? -1 : 1;
    if (aString > bString) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
}

export default function DesktopTable({
  pathname,
  columns,
  visibleColumns,
  loading,
  setLoading,
  onEdit,
  selectedStatus,
  selectedCategory,
  selectedPriority,
  searchTerm,
}: {
  pathname: string;
  columns: Column[];
  visibleColumns: string[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onEdit?: (row: any) => void;
  selectedStatus?: string | null;
  searchTerm?: string;
  selectedCategory?: string | null;
  selectedPriority?: string | null;
}) {
  const [data, setData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      fetchData({
        setData: (newData) => {
          setOriginalData(newData);
          setData(newData);
        },
        setLoading,
        url: pathname,
        selectedStatus,
        selectedCategory,
        selectedPriority,
        searchTerm,
      });
    };

    fetchData({
      setData: (newData) => {
        setOriginalData(newData);
        setData(newData);
      },
      setLoading,
      url: pathname,
      selectedStatus,
      selectedCategory,
      selectedPriority,
      searchTerm,
    });

    window.addEventListener("create", refresh);

    return () => window.removeEventListener("create", refresh);
  }, [selectedStatus, selectedCategory, selectedPriority, searchTerm]);

  // Apply sorting when sortConfig or originalData changes
  useEffect(() => {
    if (originalData.length > 0) {
      const sortedData = sortData(originalData, sortConfig);
      setData(sortedData);
    }
  }, [sortConfig, originalData]);

  const handleSort = (columnKey: string) => {
    setSortConfig((prevConfig) => {
      if (!prevConfig || prevConfig.key !== columnKey) {
        return { key: columnKey, direction: "asc" };
      }

      if (prevConfig.direction === "asc") {
        return { key: columnKey, direction: "desc" };
      }

      if (prevConfig.direction === "desc") {
        return null;
      }

      return { key: columnKey, direction: "asc" };
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      );
    }

    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 text-blue-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600" />
    );
  };

  const isAllSelected = data.length > 0 && selectedData.length === data.length;

  const toggleSelectAll = () => {
    setSelectedData(
      isAllSelected ? [] : data.map((item) => item.id.toString())
    );
  };

  const toggleSelectData = (id: string) => {
    setSelectedData((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = (ids: string[]) => {
    deleteData({
      url: pathname,
      ids,
      onSuccess: () => {
        const updatedData = originalData.filter(
          (item) => !ids.includes(item.id.toString())
        );
        setOriginalData(updatedData);
        setData(sortData(updatedData, sortConfig));
        setSelectedData((prev) => prev.filter((id) => !ids.includes(id)));
        setActionMenuOpenId(null);
      },
      onError: (err) => {
        console.error("Delete failed:", err);
      },
    });
  };

  const handleRowClick = (id: string) => {
    if (pathname === "/contacts/") {
      router.push(`/contacts/detail/${id}`);
    } else if (pathname === "/companies/") {
      router.push(`/companies/detail/${id}`);
    } else if (pathname === "/tasks/") {
      router.push(`/tasks/detail/${id}`);
    }
  };

  return (
    <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="w-full relative">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No
            </th>

            {columns
              .filter((col) => visibleColumns.includes(col.key))
              .map((col) => (
                <th
                  key={col.key}
                  className={`group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable !== false
                      ? "cursor-pointer hover:bg-gray-100 select-none"
                      : ""
                    }`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center justify-between">
                    <span>{col.label}</span>
                    {col.sortable !== false && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td className="px-6 py-4" colSpan={visibleColumns.length + 2}>
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                className="px-6 py-4 text-gray-500 text-center"
                colSpan={visibleColumns.length + 2}
              >
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(row.id)}
              >
                <td className="px-6 py-4 text-sm text-center">{index + 1}</td>

                {columns
                  .filter((col) => visibleColumns.includes(col.key))
                  .map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-xs text-gray-900"
                    >
                      {col.render
                        ? col.render(getNestedValue(row, col.key), row)
                        : getNestedValue(row, col.key) ?? "-"}
                    </td>
                  ))}

                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="relative" data-action-menu>
                    <button
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuOpenId(
                          row.id.toString() === actionMenuOpenId
                            ? null
                            : row.id.toString()
                        );
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {actionMenuOpenId === row.id.toString() && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpenId(null);
                          }}
                        />

                        <div
                          className={`absolute right-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden action-menu ${data.indexOf(row) >= data.length - 2
                              ? "bottom-full mb-1"
                              : "top-full mt-1"
                            }`}
                        >
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(row);
                                setActionMenuOpenId(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete([row.id.toString()]);
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
  );
}
