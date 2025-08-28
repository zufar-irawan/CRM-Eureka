"use client"

import Sidebar from "@/components/Sidebar"
import dynamic from "next/dynamic"
import ActivityTable from "./components/ActivityTable"
import EmptySection from "./components/EmptySection"
import useUser from "../../../hooks/useUser"
import { useEffect, useState } from "react"
import axios from "axios"
import { number } from "framer-motion"
import { checkAuthStatus } from "../../../utils/auth"
import { redirect } from "next/navigation"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

export default function Dashboard() {
    const router = useRouter()

    useEffect(() => {
        // Cek auth status menggunakan server-side check
        const checkAuth = async () => {
            try {
                const isAuthenticated = await checkAuthStatus();
                if (!isAuthenticated) {
                    Swal.fire({
                        icon: "info",
                        title: "You're not logged in",
                        text: "Make sure to login first!"
                    });
                    router.replace('/login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.replace('/login');
            }
        };

        checkAuth();
    }, [router]);

    const { user, loading } = useUser()
    const [isMinimized, setIsMinimized] = useState(false)

    const BarChart = dynamic(() => import("./components/BarChart"), { ssr: false })

    const [cards, setCards] = useState([
        {
            id: 1,
            number: "0",
            title: "New Leads"
        },
        {
            id: 2,
            number: "0",
            title: "All Leads"
        },
        {
            id: 3,
            number: "0",
            title: "Unconverted Leads"
        },
        {
            id: 4,
            number: "0",
            title: "Active Deals"
        },
    ])

    const fetchNewLeads = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/leads', {
                params: { stage: 'New' },
                withCredentials: true,
            })

            return response.data.leads
        } catch (error: any) {
            console.error('Error fetching leads: ', error.message)
            throw error
        }
    }

    const fetchAllDeals = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/deals', {
                params: { stage_ne: ['won', 'lost'] },
                withCredentials: true,
            })

            const data = response.data.data
            return data.length.toString()
        } catch (error: any) {
            console.error('Error fetching leads: ', error.message)
            throw error
        }
    }

    const fetchALlLeads = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/leads', {
                params: { status: '' },
                withCredentials: true,
            })

            const res = response.data.leads
            return res.length.toString()
        } catch (error: any) {
            console.error('Error fetching leads: ', error.message)
            throw error
        }
    }

    const fetchAllUnconvertedLeads = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/leads', {
              withCredentials: true,
            })

            const res = response.data.leads
            return res.length.toString()
        } catch (error: any) {
            console.error('Error fetching leads: ', error.message)
            throw error
        }
    }

    useEffect(() => {
        const loadData = async () => {
            const newleads = await fetchNewLeads()
            const allLeads = await fetchALlLeads()
            const notWonDeals = await fetchAllDeals()
            const unconvertedLeads = await fetchAllUnconvertedLeads()
            setCards(prevCards =>
                prevCards.map(card =>
                    card.id === 1
                        ? { ...card, number: newleads.length.toString() }
                        : (card.id === 2
                            ? { ...card, number: allLeads }
                            : (card.id === 3
                                ? { ...card, number: unconvertedLeads }
                                : (card.id === 4
                                    ? { ...card, number: notWonDeals }
                                    : card
                                )
                            )
                        )
                )
            )
        }

        loadData()
    }, [])

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

            <div className={`flex ${isMinimized ? 'ml-16' : 'ml-50'} flex-1 flex-col bg-slate-100 overflow-hidden`}>
                <header className="bg-slate-800 text-white p-4 text-right flex-shrink-0">
                    <p className="text-lg">
                        Hi, <span>{loading ? "..." : user?.name || "User"}</span>
                    </p>
                </header>

                <main className="px-6 py-4 space-y-4 flex-1 overflow-hidden flex flex-col">
                    {/* Stats Cards - Compact */}
                    <div className="grid grid-cols-4 gap-3 flex-shrink-0">
                        {cards.map((card) => (
                            <div key={card.id} className="border rounded-2xl border-gray-300 p-4 bg-white">
                                <p className="text-xl font-bold text-gray-800">
                                    {card.number}
                                </p>
                                <p className="text-sm text-gray-700">
                                    {card.title}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Two sections side by side - Fixed height */}
                    <div className="flex gap-4 flex-shrink-0" style={{height: '280px'}}>
                        <div className="border rounded-2xl border-gray-300 p-4 bg-white flex-1">
                            <p className="text-lg text-gray-900 mb-2">
                                Chart
                            </p>
                            <div className="h-56 flex items-center justify-center">
                                <div className="w-48 h-48">
                                    <BarChart />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <EmptySection />
                        </div>
                    </div>

                    {/* Recent Activities - Flexible height */}
                    <div className="border rounded-2xl border-gray-300 p-4 bg-white flex-1 min-h-0 flex flex-col">
                        <p className="text-lg text-gray-900 mb-2 flex-shrink-0">
                            Recent Activities
                        </p>
                        <div className="flex-1 overflow-auto">
                            <ActivityTable />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}