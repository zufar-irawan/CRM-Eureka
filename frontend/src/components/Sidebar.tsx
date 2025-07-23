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
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Leads", path: "/leads" },
  { icon: Handshake, label: "Deals", path: "/deals" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Building, label: "Companies", path: "/companies" },
  { icon: FileText, label: "Quotations", path: "/quotations" },
  { icon: FileSignature, label: "Contracts", path: "/contracts" },
  { icon: LineChart, label: "Reports", path: "/reports" },
];

const Sidebar = () => {
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="w-64 bg-slate-800 text-white h-screen flex flex-col">
      {/* Header & Dropdown */}
      <div className="p-4 border-b border-slate-700 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex flex-col items-start gap-2"
        >
          <img
            src="/images/eureka-full-logo.png"
            alt="CRM Logo"
            className="h-6 max-w-[100px] object-contain"
          />
          <div className="text-left">
            <h1 className="text-sm font-semibold leading-none">CRM</h1>
            <p className="text-xs text-slate-400 leading-tight flex items-center gap-1">
              Administrator <ChevronDown size={14} />
            </p>
          </div>
        </button>

        {/* Dropdown animated */}
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
            const isActive = active === item.label;

            return (
              <li key={index}>
                <button
                  onClick={() => {
                    setActive(item.label);
                    router.push(item.path);
                  }}
                  className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
