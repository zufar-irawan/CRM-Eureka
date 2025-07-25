"use client";

import Sidebar from "@/components/Sidebar";
import { AlignJustify, ChevronDown, Kanban } from "lucide-react";
import { useState } from "react";
import MainLeads from "./layouts/MainContentLeads";
import CreateLeadModal from "./add/page";
import KanbanLead from "./layouts/KanbanContentLeads";

export default function Leads() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<"List" | "Kanban">("List");

  const handleSelect = (view: "List" | "Kanban") => {
    setSelectedView(view);
    setIsOpen(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className="p-4 pl-8 flex flex-row shadow-sm border-b border-gray-200">
          <div className="flex flex-1 items-center relative">
            <h2 className="text-md text-gray-500 mr-2">Leads /</h2>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex cursor-pointer hover:scale-105 hover:-translate-y-0.5 transition-transform items-center"
            >
              {selectedView === "List" ? (
                <AlignJustify size={13} className="text-gray-500 mr-1.5" />
              ) : (
                <Kanban size={15} className="text-gray-500 mr-1" />
              )}
              <h2 className="text-md text-gray-900 mr-1">{selectedView}</h2>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute top-10 left-28 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-md z-10">
                <ul className="text-sm text-gray-700">
                  <li>
                    <button
                      onClick={() => handleSelect("List")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      List
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSelect("Kanban")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Kanban
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Create Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative inline-block group"
          >
            <span className="relative flex hover:scale-105 text-md bg-black rounded-md overflow-hidden transition-all px-3 py-1 text-white items-center">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center">
                <span className="mr-1.5">+</span> Create
              </span>
            </span>
          </button>
        </header>

        {/* Content Toggle */}
        {selectedView === "List" && <MainLeads />}
        {selectedView === "Kanban" && <KanbanLead />}

        {/* Modal */}
        {isModalOpen && (
          <CreateLeadModal onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    </div>
  );
}
