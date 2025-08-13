"use client";

import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

// 1️⃣ Definisikan tipe status dari API
type TaskStatus = "new" | "pending" | "completed" | "overdue" | "cancelled";

// 2️⃣ Tipe data task sesuai API
interface Task {
    id: number;
    title: string;
    status: TaskStatus;
    // tambahkan properti lain jika ada
}

export default function TaskDonutChart() {
    const [chartData, setChartData] = useState({
        labels: ["New", "Pending", "Completed", "Overdue", "Cancelled"],
        datasets: [
            {
                label: "Tasks",
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    "#3B82F6", // blue-500 → New
                    "#FACC15", // yellow-400 → Pending
                    "#22C55E", // green-500 → Completed
                    "#EF4444", // red-500 → Overdue
                    "#6B7280"  // gray-500 → Cancelled
                ],
                borderWidth: 1
            }
        ]
    });

    const fetchTasks = async () => {
        try {
            const response = await axios.get<{ data: Task[] }>("http://localhost:3000/api/tasks");
            const tasks = response.data.data || [];

            // Hitung jumlah task per status (strongly typed)
            const counts: Record<TaskStatus, number> = {
                new: 0,
                pending: 0,
                completed: 0,
                overdue: 0,
                cancelled: 0
            };

            tasks.forEach(task => {
                counts[task.status]++;
            });

            setChartData({
                labels: ["New", "Pending", "Completed", "Overdue", "Cancelled"],
                datasets: [
                    {
                        label: "Tasks",
                        data: [
                            counts.new,
                            counts.pending,
                            counts.completed,
                            counts.overdue,
                            counts.cancelled
                        ],
                        backgroundColor: [
                            "#3B82F6",
                            "#FACC15",
                            "#22C55E",
                            "#EF4444",
                            "#6B7280"
                        ],
                        borderWidth: 1
                    }
                ]
            });

        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="max-w-md mx-auto">
            <Doughnut data={chartData} />
        </div>
    );
}
