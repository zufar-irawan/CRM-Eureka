"use client"

import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import { usePathname } from "next/navigation"
import { useState } from "react"
import CreateLeadModal from "./add/AddLeadModal"

export default function LeadsLayout(
    { children }: { children: React.ReactNode }
) {
    const [isMinimized, setIsMinimized] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const PathName = usePathname()

    return (
        <div className="flex h-screen">
            <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

            <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-50'} flex flex-col bg-white transition-all duration-300`}>
                <Header
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    setIsModalOpen={setIsModalOpen}
                    pathname={PathName}
                />

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>


            {isModalOpen && (
                <CreateLeadModal onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    )
}