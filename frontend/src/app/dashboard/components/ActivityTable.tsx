"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface TaskResult {
    id: number;
    task_id: number;
    result_text: string;
    result_type: string;
    result_date: string; // ISO date string
    created_by: number;
}

interface Task {
    id: number;
    lead_id: number;
    title: string;
    status: string;
    results: TaskResult[];
}

interface Activity {
    activity: string;
    lead: string | number;
    date: string;
}

export default function ActivityTable() {
    const [activities, setActivities] = useState<Activity[]>([]);

    const fetchActivities = async () => {
        try {
            const response = await axios.get<{ success: boolean; data: Task[] }>(
                "http://localhost:3000/api/tasks"
            );

            const now = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);

            const filtered = response.data.data
                .filter((task) => task.status === "completed") // ambil task done
                .flatMap((task) =>
                    task.results
                        .filter((r) => {
                            const resultDate = new Date(r.result_date);
                            return resultDate >= sevenDaysAgo && resultDate <= now;
                        })
                        .map((r) => ({
                            activity: task.title,
                            lead: task.lead_id,
                            date: new Date(r.result_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            })
                        }))
                );

            setActivities(filtered);
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
            <div className="grid grid-cols-3 font-semibold text-gray-500 text-sm border-b pb-4">
                <div className="">Activity</div>
                <div className="">Lead</div>
                <div className="text-right">Date</div>
            </div>

            {/* Rows */}
            {activities.length > 0 ? (
                activities.map((item, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-3 items-center border-gray-800 text-sm pb-4 pt-4 first:pt-0 border-b last:border-b-0"
                    >
                        <div className="flex items-center gap-2 text-gray-800">
                            {item.activity}
                        </div>
                        <div className="text-gray-800">{item.lead}</div>
                        <div className="text-right text-gray-800">{item.date}</div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 py-4">No recent activities</div>
            )}
        </div>
    );
}
