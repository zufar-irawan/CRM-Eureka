"use client"

import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { usePathname } from "next/navigation"
import { useState } from "react"
import CreateLeadModal from "./add/AddLeadModal"

export default function LeadsLayout(
  { children }: { children: React.ReactNode }
) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  // Cek apakah sedang di halaman detail (contoh: /leads/123 atau /leads/detail/123)
  const isDetailPage = /^\/leads(\/detail)?\/[^\/]+$/.test(pathname)

  return (
    <div className="flex h-screen">
      <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

      <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-50'} flex flex-col bg-white transition-all duration-300`}>
        {/* Hanya tampilkan Header jika bukan di halaman detail */}
        {!isDetailPage && (
          <Header
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setIsModalOpen={setIsModalOpen}
            pathname={pathname}
          />
        )}

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
