"use client";

import Sidebar from "@/components/Sidebar";
import { AlignJustify, ChevronDown } from "lucide-react";
import { useState } from "react";
import MainContentDeals from "./layouts/MainContentDeals";

export default function Deals() { 
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className="p-4 flex flex-row shadow-sm border-b border-gray-200">
          <div className="flex flex-1 items-center space-x-2">
            <h2 className="text-xl text-gray-500">Deals /</h2> {/* Ubah dari "Leads" ke "Deals" */}
            <AlignJustify size={18} className="text-gray-500" />
            <h2 className="text-xl text-gray-900">List</h2>
            <ChevronDown size={20} className="text-gray-500" />
          </div>

          {/* Create Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative inline-block group"
          >
            <span className="relative flex hover:scale-105 text-md bg-black rounded-2xl overflow-hidden transition-all px-3 py-2 text-white items-center">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center">
                <span className="mr-1.5">+</span> Create
              </span>
            </span>
          </button>
        </header>

        {/* Tambahkan MainContentDeals di sini */}
        <MainContentDeals />

        {/* Modal jika diperlukan */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Create New Deal</h3>
              <p className="mb-4">Deal creation form would go here...</p>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}