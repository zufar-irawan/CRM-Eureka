"use client"

import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import { usePathname } from "next/navigation"
import { useState } from "react"
import React from "react"

export default function ReportsLayout(
  { children }: { children: React.ReactNode }
) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />

      <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-50'} flex flex-col bg-gray-50 transition-all duration-300`}>
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setIsModalOpen={setIsModalOpen}
          pathname={pathname}
        />

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}