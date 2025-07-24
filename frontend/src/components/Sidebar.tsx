"use client";

import React, { useState } from "react";
import {
  Bell,
  BarChart3,
  Users,
  Handshake,
  CheckSquare,
  Building,
  FileText,
  FileSignature,
  LineChart,
  Sun,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { usePathname } from "next/navigation";
import Link from "next/link"

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { icon: Bell, label: "Notifications", link: "#" },
    { icon: BarChart3, label: "Dashboard", link: "/dashboard" },
    { icon: Users, label: "Leads", link: "/leads" },
    { icon: Handshake, label: "Deals", link: "/deals" },
    { icon: CheckSquare, label: "Tasks", link: "/tasks" },
    { icon: Building, label: "Companies", link: "/company" },
    { icon: FileText, label: "Quotations", link: "/quotations" },
    { icon: FileSignature, label: "Contracts", link: "/contracts" },
    { icon: LineChart, label: "Reports", link: "reports" },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      {/* Admin Info Header */}
      <div className="p-4 border-b border-slate-700 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex flex-col items-start gap-2"
        >
          <Image
            src="/Images/logo-crm-eureka.png"
            alt="CRM Logo"
            width={140}
            height={10}
          />
          <div className="text-left">
            {/* <h1 className="text-sm font-semibold leading-none">CRM</h1> */}
            <p className="text-xs text-slate-400 leading-tight flex items-center gap-1">
              Administrator <ChevronDown size={14} />
            </p>
          </div>
        </button>

        {/* Dropdown with animation */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 mt-2 w-52 bg-white text-sm text-slate-800 rounded-md shadow-md z-50 border border-slate-200"
            >
              <ul className="py-1">
                <li>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100">
                    <Sun size={15} />
                    Toggle Theme
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100">
                    <Settings size={15} />
                    Settings
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100">
                    <LogOut size={15} />
                    Log Out
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 py-3">
        <ul className="space-y-1 px-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.link;

            return (
              <li key={index}>
                <Link href={item.link}>
                  <div
                    className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors duration-200 ${isActive
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );
};

export default Sidebar;
