import axios from "axios";
import { useEffect, useState } from "react";

interface Task {
    id: number;
    assigned_to: number;
    status: string;
}

interface PivotedActivity {
    sales: string;
    overdue: number;
    new: number;
    pending: number;
    completed: number;
    cancelled: number;
}

const STATUS_COLUMNS = ["overdue", "new", "pending", "completed", "cancelled"];

export default function EmptySection() {
    const [pivotData, setPivotData] = useState<PivotedActivity[]>([]);

    useEffect(() => {
        const fetchAllTask = async () => {
            try {
                const taskRes = await axios.get("http://localhost:3000/api/tasks");
                const tasks: Task[] = taskRes.data.data;

                // Ambil nama sales per assigned_to
                const salesMap: Record<number, string> = {};
                for (const task of tasks) {
                    if (!salesMap[task.assigned_to]) {
                        const response = await axios.get(`http://localhost:3000/api/users/${task.assigned_to}`);
                        salesMap[task.assigned_to] = response.data.data.name;
                    }
                }

                // Pivot data: sales => status => count
                const pivot: Record<string, PivotedActivity> = {};

                for (const task of tasks) {
                    const salesName = salesMap[task.assigned_to] || "Unknown Sales";

                    if (!pivot[salesName]) {
                        pivot[salesName] = {
                            sales: salesName,
                            overdue: 0,
                            new: 0,
                            pending: 0,
                            completed: 0,
                            cancelled: 0,
                        };
                    }

                    const statusKey = task.status.toLowerCase();
                    if (STATUS_COLUMNS.includes(statusKey)) {
                        pivot[salesName][statusKey as keyof PivotedActivity]++;
                    }
                }

                // Ubah ke array dan limit jadi 10 sales teratas
                const pivotArray = Object.values(pivot).slice(0, 10);

                setPivotData(pivotArray);
            } catch (error) {
                console.error("Error fetching activities:", error);
            }
        };

        fetchAllTask();
    }, []);

    return (
        <div className="border rounded-3xl border-gray-300 p-8 bg-white flex-1">
            <p className="text-xl text-gray-900 mb-4">All Task Summary</p>

            <div className="p-4 w-full max-w-5xl mx-auto mt-6 overflow-x-auto">
                {/* Header Row */}
                <div className="grid grid-cols-6 font-semibold text-gray-500 text-xs border-b pb-4 text-center">
                    <div>Sales</div>
                    {STATUS_COLUMNS.map((status) => (
                        <div key={status} className="capitalize">
                            {status}
                        </div>
                    ))}
                </div>

                {/* Data Rows */}
                {pivotData.length > 0 ? (
                    pivotData.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-6 items-center text-xs py-4 border-b last:border-b-0 text-center"
                        >
                            <div className="text-gray-800">{item.sales}</div>
                            <div className="text-gray-800">{item.overdue}</div>
                            <div className="text-gray-800">{item.new}</div>
                            <div className="text-gray-800">{item.pending}</div>
                            <div className="text-gray-800">{item.completed}</div>
                            <div className="text-gray-800">{item.cancelled}</div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-4">
                        No recent activities
                    </div>
                )}
            </div>
        </div>
    );
}
