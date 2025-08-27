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

type TaskStatus = "new" | "pending" | "completed" | "overdue" | "cancelled";

interface Task {
    id: number;
    title: string;
    status: TaskStatus;
}

export default function TaskDonutChart() {
    const [chartData, setChartData] = useState({
        labels: ["New", "Pending", "Completed", "Overdue", "Cancelled"],
        datasets: [
            {
                label: "Tasks",
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    "#3B82F6", 
                    "#FACC15",
                    "#22C55E",
                    "#EF4444", 
                    "#6B7280"  
                ],
                borderWidth: 0,
                cutout: '50%'
            }
        ]
    });

    const fetchTasks = async () => {
        try {
            const response = await axios.get<{ data: Task[] }>("http://localhost:3000/api/tasks");
            const tasks = response.data.data || [];

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
                        borderWidth: 0,
                        cutout: '50%'
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

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 10,
                    usePointStyle: true,
                    font: {
                        size: 10
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                cornerRadius: 4,
                displayColors: true
            }
        }
    };

    return (
        <div className="w-full h-full">
            <Doughnut data={chartData} options={options} />
        </div>
    );
}