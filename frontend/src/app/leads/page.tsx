"use client"

import Sidebar from "@/components/Sidebar"
import { AlignJustify, ChevronDown } from "lucide-react"
import Link from "next/link"
import MainLeads from "./layouts/MainContentLeads"

export default function Leads() {
    return (
        <div className="flex h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col bg-white">

                <header className="p-4 flex flex-row shadow-sm border-b border-gray-200">
                    <div className="flex flex-1 items-center space-x-2">
                        <h2 className="text-xl text-gray-500">Leads /</h2>

                        <AlignJustify size={18} className="text-gray-500" />

                        <h2 className="text-xl text-gray-900">List</h2>

                        <ChevronDown size={20} className="text-gray-500" />
                    </div>

                    <Link href="#" className="relative inline-block group">
                        <button className="relative flex hover:scale-105 text-md bg-black rounded-2xl overflow-hidden transition-all px-3 py-2 text-white items-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <span className="relative z-10 flex items-center">
                                <span className="mr-1.5">+</span> Create
                            </span>
                        </button>
                    </Link>
                </header>

                <MainLeads />

            </div>
        </div>

    )
}