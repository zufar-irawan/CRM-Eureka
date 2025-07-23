"use client";

import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const data = {
    labels: ["New", "Qualified", "Proposal", "Closed"],
    datasets: [
        {
            label: "Deals",
            data: [35, 25, 15, 5],
            backgroundColor: "#3B82F6" // Tailwind Blue-500
        }
    ]
};

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top" as const
        },
    },
    scales: {
        y: {
            min: 0,
            max: 40,
            ticks: {
                stepSize: 10
            }
        }
    }
};

export default function BarChart() {
    return <Bar data={data} options={options} />;
}
