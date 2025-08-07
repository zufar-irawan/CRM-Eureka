"use client"

import { v4 as uuidv4 } from 'uuid'
import fetchKanbanData from "@/components/Kanban/Functions/FetchKanbanData";
import Kanban, { DNDType } from "@/components/Kanban/Kanban"
import { Filter, KanbanIcon, RotateCcw } from "lucide-react"
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { usePathname } from 'next/navigation';

export default function DealsKanban() {
    const [data, setData] = useState<any[]>([])
    const [isMinimized, setIsMinimized] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const pathname = usePathname()
    const [containers, setContainers] = useState<DNDType[]>([
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'proposal',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'negotiation',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-green-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'won',
            items: []
        },
        {
            id: `container-${uuidv4()}`,
            icon: <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            ,
            title: 'lost',
            items: []
        },
    ])

    const handleRefresh = () => {
        fetchKanbanData({
            url: "http://localhost:5000/api/deals",
            setData: setData,
            setContainers: setContainers,
            groupBy: "stage", // bisa diganti "status", "type", dll tergantung API
            mapItem: (deal) => ({
                id: `item-${deal.id}`,
                itemId: deal.id,
                fullname: deal.lead?.fullname || "Unknown",
                organization: deal.lead?.company || "-",
                email: deal.lead?.email || "-",
                mobileno: deal.lead?.phone || "-",
            }),
        })
    }

    useEffect(() => {
        fetchKanbanData({
            url: "http://localhost:5000/api/deals",
            setData: setData,
            setContainers: setContainers,
            groupBy: "stage", // bisa diganti "status", "type", dll tergantung API
            mapItem: (deal) => ({
                id: `item-${deal.id}`,
                itemId: deal.id,
                fullname: deal.lead?.fullname || "Unknown",
                organization: deal.lead?.company || "-",
                email: deal.lead?.email || "-",
                mobileno: deal.lead?.phone || "-",
            }),
        })
    }, []);

    return (
        <div className="flex">
            <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

            <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-50'}`}>
                <Header
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    setIsModalOpen={setIsModalOpen}
                    pathname={pathname}
                />

                <main className="p-4 overflow-auto lg:p-6 bg-white">
                    <div className="mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-2 px-2.5 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </button>

                                {/* <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                                    <Filter className="w-3 h-3" />
                                    <span className="hidden sm:inline">Filter</span>
                                </button>

                                <button className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                                    <KanbanIcon className="w-3 h-3" />
                                    <span className="hidden sm:inline">Kanban Settings</span>
                                </button> */}
                            </div>
                        </div>
                    </div>

                    <Kanban setContainers={setContainers} setData={setData} containers={containers} pathname='Deals' />
                </main>
            </div>

        </div>
    )
}