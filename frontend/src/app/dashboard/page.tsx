"use client"

import Sidebar from "@/components/Sidebar"
import dynamic from "next/dynamic"
import ActivityTable from "./components/ActivityTable"
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
                params: { stage: 'New' }
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
                params: { stage_ne: ['won', 'lost'] }
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
                params: { status: '' }
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
            const response = await axios.get('http://localhost:3000/api/leads')

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
                            All Tasks
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