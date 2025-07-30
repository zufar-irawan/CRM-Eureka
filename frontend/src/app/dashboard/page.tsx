"use client"

import Sidebar from "@/components/Sidebar"
import dynamic from "next/dynamic"
import ActivityTable from "./components/ActivityTable"
import useUser from "../../../hooks/useUser"
import { useState } from "react"

export default function Dashboard() {
    const { user, loading } = useUser()
    const [isMinimized, setIsMinimized] = useState(false)

    const BarChart = dynamic(() => import("./components/BarChart"), { ssr: false })

    const cards = [
        {
            id: 1,
            number: "120",
            title: "Open Leads"
        },
        {
            id: 2,
            number: "45",
            title: "Deals in Progress"
        },
        {
            id: 3,
            number: "$18,500",
            title: "Revenue"
        },
        {
            id: 4,
            number: "12",
            title: "Tasks"
        },
    ]

    return (
        <div className="flex min-h-screen">
            <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

            <div className={`flex ${isMinimized ? 'ml-16' : 'ml-50'} flex-1 flex-col bg-slate-100`}>
                <header className="bg-slate-800 text-white p-8 text-right">
                    <p className="text-xl">
                        Hi, <span>{loading ? "..." : user?.name || "User"}</span>
                    </p>
                </header>

                <main className="px-15 py-10 space-y-6">
                    <div className="text-center grid grid-cols-4 gap-3">
                        {cards.map((card) => (
                            <div key={card.id} className="border rounded-3xl border-gray-300 p-8 bg-white">
                                <p className="text-2xl font-bold text-gray-800">
                                    {card.number}
                                </p>

                                <p className="text-xl text-gray-700">
                                    {card.title}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border rounded-3xl border-gray-300 p-8 bg-white">
                        <p className="text-xl text-gray-900 mb-4">
                            Deals by Stage
                        </p>

                        <BarChart />
                    </div>

                    <div className="border rounded-3xl border-gray-300 p-8 bg-white">
                        <p className="text-xl text-gray-900">
                            Recent Activities
                        </p>

                        <ActivityTable />
                    </div>

                </main>
            </div>

        </div>
    )
}