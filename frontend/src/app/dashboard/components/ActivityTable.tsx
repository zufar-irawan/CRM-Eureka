"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface TaskResult {
    id: number;
    task_id: number;
    result_text: string;
    result_type: string;
    result_date: string;
    created_by: number;
}

interface Task {
    id: number;
    lead_id: number;
    title: string;
    status: string;
    results: TaskResult[];
    created_by_name: string;
    updated_at: string; // ← ambil tanggal dari sini
}

interface Activity {
    activity: string;
    lead: string | number;
    date: string;
    createdBy: string;
    dateRaw: string; // untuk sorting
}

export default function ActivityTable() {
    const [activities, setActivities] = useState<Activity[]>([]);

    const fetchActivities = async () => {
        try {
            const response = await axios.get<{ success: boolean; data: Task[] }>(
                "http://localhost:3000/api/tasks"
            );

            const tasks = response.data.data;
            const leadsMap: Record<string, string> = {};

            // Ambil nama lead
            for (const task of tasks) {
                const response2 = await axios.get(
                    `http://localhost:3000/api/leads/${task.lead_id}`
                );
                leadsMap[task.lead_id] = response2.data.fullname;
            }

            // Ambil semua task completed, ambil tanggal dari updated_at
            const filtered = response.data.data
                .filter((task) => task.status === "completed")
                .map((task) => ({
                    activity: task.title,
                    lead: leadsMap[task.lead_id],
                    date: new Date(task.updated_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }),
                    createdBy: task.created_by_name,
                    dateRaw: task.updated_at
                }));

            // Urutkan data berdasarkan updated_at terbaru dan ambil 10 teratas
            const sorted = filtered
                .sort(
                    (a, b) =>
                        new Date(b.dateRaw).getTime() - new Date(a.dateRaw).getTime()
                )
                .slice(0, 10);

            setActivities(sorted);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return (
        <div className="p-4 w-full max-w-5xl mx-auto mt-6">
            {/* Header Row */}
            <div className="grid grid-cols-4 font-semibold text-gray-500 text-sm border-b pb-4">
                <div>Activity</div>
                <div>Lead</div>
                <div>Created By</div>
                <div className="text-right">Date</div>
            </div>

            {/* Rows */}
            {activities.length > 0 ? (
                activities.map((item, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-4 items-center border-gray-800 text-sm pb-4 pt-4 first:pt-0 border-b last:border-b-0"
                    >
                        <div className="flex items-center gap-2 text-gray-800">
                            {item.activity}
                        </div>
                        <div className="text-gray-800">{item.lead}</div>
                        <div className="text-gray-800">
                            {item.createdBy === "Uknown" ? "Unknown" : item.createdBy}
                        </div>
                        <div className="text-right text-gray-800">{item.date}</div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 py-4">
                    No recent activities
                </div>
            )}
        </div>
    );
}
