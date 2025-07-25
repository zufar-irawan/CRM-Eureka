"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { AlignJustify } from "lucide-react";
import MainContentTasks from "./layouts/MainContentTasks";

export default function Tasks() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className="p-4 pl-8 flex justify-between items-center shadow-sm border-b border-gray-200">
          <div className="flex items-center">
            <h2 className="text-xl text-gray-500 mr-2">Tasks /</h2>
            <AlignJustify size={16} className="text-gray-500 mr-1" />
            <span className="text-xl text-gray-900">List</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="relative inline-block group focus:outline-none"
          >
            <span className="relative flex items-center px-3 py-2 text-md text-white bg-black rounded-2xl overflow-hidden transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center">
                <span className="mr-1.5">+</span> Create
              </span>
            </span>
          </button>
        </header>

        <MainContentTasks />
      </div>
    </div>
  );
}
