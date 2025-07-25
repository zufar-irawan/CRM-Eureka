"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import useUser from "../../hooks/useUser";

const Sidebar = () => {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, loading } = useUser();

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

  return (
    <div className={`${isMinimized ? 'w-16' : 'w-50 pr-8 pl-2 '} pt-2 bg-slate-800 text-white min-h-screen flex flex-col transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <button
        onClick={() => {
          setIsMinimized(!isMinimized);
          setIsDropdownOpen(false); // Close dropdown when minimizing
        }}
        className="absolute -right-3 top-6 bg-slate-800 border border-slate-600 text-white rounded-full p-1 hover:bg-slate-700 transition-colors z-20"
      >
        {isMinimized ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Admin Info Header */}
      <div className="p-4 border-b border-slate-700 relative">
        {!isMinimized ? (
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
              <p className="text-xs text-slate-400 leading-tight flex items-center gap-1">
                Administrator <ChevronDown size={14} />
              </p>
            </div>
          </button>
        ) : (
          <div className="flex justify-center">
            <Image
              src="/Images/logo-crm.png"
              alt="ERM Logo"
              width={32}
              height={32}
            />
          </div>
        )}

        {/* Dropdown animated */}
        <AnimatePresence>
          {isDropdownOpen && !isMinimized && (
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
                    className={`w-full flex items-center ${isMinimized ? 'justify-center px-2' : 'space-x-2 px-2.5'} py-2 rounded-md text-xs font-medium transition-colors duration-200 ${isActive
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    title={isMinimized ? item.label : undefined}
                  >
                    <Icon size={18} />
                    {!isMinimized && <span>{item.label}</span>}
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