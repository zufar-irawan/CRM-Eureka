"use client"

import { AlignJustify, ChevronDown, Kanban } from "lucide-react";
import { redirect } from "next/navigation";

type headerProps = {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    setIsModalOpen: (val: boolean) => void;
    pathname: string;
}

export default function Header({ isOpen, setIsOpen, setIsModalOpen, pathname }: headerProps) {

    let title = ""

    if (pathname === "/deals" || pathname === "/deals/kanban") {
        title = "Deals"
    } else if (pathname === "/leads" || pathname === "/leads/kanban") {
        title = "Leads"
    } else if (pathname === "/tasks" || pathname === "/tasks/kanban") {
        title = "Tasks"
    }

    return (
        <header className="px-6 py-4 flex flex-row shadow-sm border-b border-gray-200">
            <div className="flex flex-1 items-center relative">
                <h2 className="text-md text-gray-500 mr-2">{title} /</h2>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex cursor-pointer hover:scale-105 hover:-translate-y-0.5 transition-transform items-center"
                >
                    {pathname === "/deals" ? (
                        <AlignJustify size={13} className="text-gray-500 mr-1.5" />
                    ) : (
                        <Kanban size={15} className="text-gray-500 mr-1" />
                    )}
                    <h2 className="text-md text-gray-900 mr-1">{pathname === "/deals" ? "List" : "Kanban"}</h2>
                    <ChevronDown size={16} className="text-gray-500" />
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute top-10 left-28 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-md z-50">
                        <ul className="text-sm text-gray-700">
                            <li>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        redirect('/deals')
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                    List
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        redirect('/deals/kanban')
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                    Kanban
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="relative inline-block group"
            >
                <span className="relative flex hover:scale-105 text-md bg-black rounded-md overflow-hidden transition-all px-3 py-1.5 text-white items-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10 flex items-center">
                        <span className="mr-1.5">+</span> Create
                    </span>
                </span>
            </button>
        </header>
    )
}