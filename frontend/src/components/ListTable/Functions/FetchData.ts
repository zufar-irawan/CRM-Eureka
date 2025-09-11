import axios from "axios";
import React from "react";
import Swal from "sweetalert2";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
    withCredentials: true,
});

type fetchDataProps = {
    setData: React.Dispatch<React.SetStateAction<any[]>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    url: string;
    selectedStatus?: string | null;
    selectedCategory?: string | null;
    selectedPriority?: string | null;
    searchTerm?: string;
    assignedTo?: string | number;
    createdBy?: number;
};

const fetchData = async ({
    setData,
    setLoading,
    url,
    selectedStatus,
    selectedCategory,
    selectedPriority,
    searchTerm,
    assignedTo,
    createdBy,
}: fetchDataProps) => {
    console.log("assignedTo:", assignedTo, "createdBy:", createdBy);

    try {
        setLoading(true);

        // kalau dua-duanya ada → fetch 2x
        if (assignedTo && createdBy) {
            const [createdRes, assignedRes] = await Promise.all([
                api.get(url, {
                    params: {
                        status: selectedStatus || undefined,
                        priority: selectedPriority || undefined,
                        category: selectedCategory || undefined,
                        created_by: createdBy,
                        search: searchTerm || undefined,
                    },
                }),
                api.get(url, {
                    params: {
                        status: selectedStatus || undefined,
                        priority: selectedPriority || undefined,
                        category: selectedCategory || undefined,
                        assigned_to: assignedTo,
                        search: searchTerm || undefined,
                    },
                }),
            ]);

            // gabung hasil, hapus duplikat berdasarkan id
            const combined = [
                ...(createdRes.data.data || []),
                ...(assignedRes.data.data || []),
            ];
            const unique = Array.from(new Map(combined.map((item: any) => [item.id, item])).values());

            setData(unique);
        } else {
            // normal single request
            const params: Record<string, any> = {};
            if (selectedStatus) params.status = selectedStatus;
            if (selectedPriority) params.priority = selectedPriority;
            if (selectedCategory) params.category = selectedCategory;
            if (assignedTo) params.assigned_to = assignedTo;
            if (createdBy) params.created_by = createdBy;
            if (searchTerm) params.search = searchTerm;

            const response = await api.get(url, { params });
            setData(response.data.data);
        }
    } catch (err: any) {
        Swal.fire({
            title: "Error",
            text: err.message || String(err),
            icon: "error",
        });
    } finally {
        setLoading(false);
    }
};

export default fetchData;
