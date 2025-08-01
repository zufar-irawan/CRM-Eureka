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

    const path = [
        "/leads",
        "/deals",
        "/tasks",
        "/companies"
    ]

    if (pathname.startsWith("/deals")) {
        title = "Deals"
    } else if (pathname.startsWith("/leads")) {
        title = "Leads"
    } else if (pathname.startsWith("/tasks")) {
        title = "Tasks"
    } else if (pathname.startsWith("/companies")) {
        title = "Companies"
    }

    return (
        <header className="px-6 py-4 flex flex-row shadow-sm border-b border-gray-200">
            <div className="flex flex-1 items-center relative">
                <h2 className="text-md text-gray-500 mr-2">{title} /</h2>
                {title === "Companies" ?
                    (
                        <div className="flex items-center">
                            <AlignJustify size={13} className="text-gray-500 mr-1.5" />
                            <h2 className="text-md text-gray-900 mr-1">List</h2>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex cursor-pointer hover:scale-105 hover:-translate-y-0.5 transition-transform items-center"
                        >
                            {["/deals", "/leads", "/tasks"].includes(pathname) ? (
                                <AlignJustify size={13} className="text-gray-500 mr-1.5" />
                            ) : (
                                <Kanban size={15} className="text-gray-500 mr-1" />
                            )}
                            <h2 className="text-md text-gray-900 mr-1">{["/deals", "/leads", "/tasks"].includes(pathname) ? "List" : "Kanban"}</h2>
                            <ChevronDown size={16} className="text-gray-500" />
                        </button>

                    )
                }


                {isOpen && (
                    <div className="absolute top-10 left-28 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-md z-50">
                        <ul className="text-sm text-gray-700">
                            <li>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        redirect(pathname)
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
                                        redirect(
                                            pathname.startsWith("/leads") ? path[0] + "/kanban" : (
                                                pathname.startsWith("/deals") ? path[1] + "/kanban" : (
                                                    pathname.startsWith("/tasks") ? path[2] + "/kanban" : (
                                                        pathname.startsWith("/companies") ? path[3] + "/kanban" : ""
                                                    )
                                                )))
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

            {title === "Companies" ? '' : (
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
            )}
        </header>
    )
}