'use client'

import { useEffect, useState } from "react"
import fetchData from "./Functions/FetchData"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import deleteData from "./Functions/DeleteData";

export interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
}

export default function DesktopTable(
    { pathname, columns, visibleColumns, loading, setLoading }:
        { pathname: string, columns: Column[], visibleColumns: string[], loading: boolean, setLoading: React.Dispatch<React.SetStateAction<boolean>> }

) {
    const [data, setData] = useState<any[]>([])
    const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
    const [selectedData, setSelectedData] = useState<string[]>([])
    const [currentLead, setCurrentLead] = useState<any>(null);
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [leadsToDelete, setLeadsToDelete] = useState<string[]>([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchData({ setData, setLoading, url: pathname })
    }, [])

    const isAllSelected = data.length > 0 && selectedData.length === data.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedData([]);
        } else {
            setSelectedData(data.map((data) => data.id.toString()));
        }
    }

    const toggleSelectData = (id: string) => {
        setSelectedData((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id]
        );
    }

    const handleEditLead = (lead: any) => {
        setCurrentLead(lead);
        setEditModalOpen(true);
        setActionMenuOpenId(null);
    }

    const openDeleteModal = (ids: string[]) => {
        setLeadsToDelete(ids);
        setDeleteModalOpen(true);
        setActionMenuOpenId(null);
    }

    const handleDelete = (ids: string[]) => {
        deleteData({
            url: pathname,
            ids,
            onSuccess: () => {
                setData(prev => prev.filter(item => !ids.includes(item.id.toString())));
                setSelectedData(prev => prev.filter(id => !ids.includes(id)));
                setDeleteModalOpen(false);
            },
            onError: (err) => {
                console.error("Delete failed:", err);
            }
        });
    };

    return (
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full relative">
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
                        {columns.filter(col => visibleColumns.includes(col.key)).map(col => (
                            <th
                                key={col.key}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {col.label}
                            </th>
                        ))}

                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr><td className="px-6 py-4" colSpan={visibleColumns.length + 2}>Loading...</td></tr>
                    ) : data.length === 0 ? (
                        <tr><td className="px-6 py-4 text-gray-500 text-center" colSpan={visibleColumns.length + 2}>No data found</td></tr>
                    ) : data.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                            <td className="px-6 py-4">
                                <input
                                    type="checkbox"
                                    checked={selectedData.includes(row.id.toString())}
                                    onChange={() => toggleSelectData(row.id.toString())}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                            </td>

                            {columns.filter(col => visibleColumns.includes(col.key)).map((col) => (
                                <td key={col.key} className="px-6 py-4 text-xs text-gray-900">
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                </td>
                            ))}

                            <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="relative" data-action-menu>

                                    <button
                                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActionMenuOpenId(row.id.toString() === actionMenuOpenId ? null : row.id.toString())
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

                                            <div className={`absolute right-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden action-menu ${data.indexOf(row) >= data.length - 2
                                                ? 'bottom-full mb-1'
                                                : 'top-full mt-1'
                                                }`}>
                                                <div className="py-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditLead(row);
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


                    ))}
                </tbody>
            </table>
        </div>
    )
}