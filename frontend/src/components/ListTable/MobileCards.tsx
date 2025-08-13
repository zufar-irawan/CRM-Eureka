'use client'

import { MoreHorizontal, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import fetchData from "./Functions/FetchData";

export interface Field {
    key: string;
    label?: string;
    render?: (value: any, row: any) => React.ReactNode;
}

function getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

export default function MobileCards({
    pathname,
    fields,
    visibleFields
}: {
    pathname: string;
    fields: Field[];
    visibleFields: string[];
}) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedData, setSelectedData] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchData({ setData, setLoading, url: pathname });
    }, [pathname]);

    const toggleSelectData = (id: string) => {
        setSelectedData((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id]
        );
    };

    const handleCardClick = (id: string) => {
        if (pathname === "/contacts/") {
            router.push(`/contacts/detail/${id}`)
        } else if (pathname === "/companies/") {
            router.push(`/companies/detail/${id}`)
        } else if (pathname === "/tasks/") {
            router.push(`/tasks/detail/${id}`)
        }
    };

    return (
        <div className="block lg:hidden space-y-4">
            {loading ? (
                <p className="text-2xl">Loading...</p>
            ) : data.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data found</p>
            ) : data.map((item) => (
                <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleCardClick(item.id)}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">
                                    {pathname === "/tasks/" ? item.title : item.fullname}
                                </h3>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                    {pathname === "/tasks/" ? item.status : getNestedValue(item, "company.name") || "-"}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                {pathname === "/tasks/" ? item.priority : item.stage}
                            </span>
                            <button
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Detail Fields */}
                    <div className="space-y-2 text-sm pt-2">
                        {fields
                            .filter((f) => visibleFields.includes(f.key))
                            .map((field) => {
                                const value = getNestedValue(item, field.key);
                                return (
                                    <div key={field.key} className="flex items-center text-gray-600">
                                        <span className="pr-2">{field.label ?? field.key} :</span>
                                        <span className="text-gray-800">
                                            {field.render ? field.render(value, item) : String(value ?? "-")}
                                        </span>
                                    </div>
                                );
                            })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                            {new Date(item.updated_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}