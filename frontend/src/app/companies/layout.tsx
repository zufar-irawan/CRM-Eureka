"use client"

import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import { useCompaniesModalStore } from "@/Store/companiesModalStore"
import { usePathname } from "next/navigation"
import { useState } from "react"
import CompaniesModal from "./edit/editModal"

export default function CompaniesLayout(
    { children }:
        { children: React.ReactNode }
) {
    const [isMinimized, setIsMinimized] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const { isOpens, editData, closeModal } = useCompaniesModalStore();

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

            {isOpens && editData && (
                <CompaniesModal
                    data={editData}
                    onClose={closeModal}
                    onUpdated={() => window.dispatchEvent(new Event("create"))}
                />
            )}
        </div>
    )
}