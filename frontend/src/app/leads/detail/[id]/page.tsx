"use client";

import Sidebar from "@/components/Sidebar";
import {
  Mail,
  Link2,
  Paperclip,
  BarChart3,
  CheckSquare,
  Phone,
  ChevronDown,
  Plus,
  FileText,
  Edit,
  MessageSquare,
  Database,
  StickyNote
} from "lucide-react";
import { useState } from "react";

export default function LeadDetailLayout() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("New");
  const [activeTab, setActiveTab] = useState("Notes");

  const statusOptions = [
    { name: "New", color: "bg-gray-500" },
    { name: "Contacted", color: "bg-orange-500" },
    { name: "Nurture", color: "bg-blue-500" },
    { name: "Qualified", color: "bg-green-500" },
    { name: "Unqualified", color: "bg-red-500" },
    { name: "Junk", color: "bg-purple-500" }
  ];

  const tabs = [
    { name: "Activity", icon: BarChart3 },
    { name: "Emails", icon: Mail },
    { name: "Comments", icon: MessageSquare },
    { name: "Data", icon: Database },
    { name: "Calls", icon: Phone },
    { name: "Tasks", icon: CheckSquare },
    { name: "Notes", icon: StickyNote },
    { name: "Attachments", icon: Paperclip }
  ];

  // Function to render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "Activity":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Activity</h2>
              <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
                <Plus className="w-4 h-4" />
                <span>New Activity</span>
              </button>
            </div>
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">No Activities</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Create Activity
              </button>
            </div>
          </div>
        );

      case "Emails":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Emails</h2>
              <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
                <Plus className="w-4 h-4" />
                <span>Compose Email</span>
              </button>
            </div>
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <Mail className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">No Emails</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Send Email
              </button>
            </div>
          </div>
        );

      case "Comments":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
              <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
                <Plus className="w-4 h-4" />
                <span>Add Comment</span>
              </button>
            </div>
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">No Comments</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Add Comment
              </button>
            </div>
          </div>
        );

      case "Data":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Data</h2>
              <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
                <Plus className="w-4 h-4" />
                <span>Add Data</span>
              </button>
            </div>
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <Database className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">No Data</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Import Data
              </button>
            </div>
          </div>
        );

      case "Calls":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Calls</h2>
              <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
                <Plus className="w-4 h-4" />
                <span>Log Call</span>
              </button>
            </div>
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <Phone className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">No Calls</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Make Call
              </button>
            </div>
          </div>
        );

      case "Tasks":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
              <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">No Tasks</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Create Task
              </button>
            </div>
          </div>
        );

      case "Notes":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
              <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </button>
            </div>
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">No Notes</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Create Note
              </button>
            </div>
          </div>
        );

      case "Attachments":
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Attachments</h2>
              <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800">
                <Plus className="w-4 h-4" />
                <span>Upload File</span>
              </button>
            </div>
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                <Paperclip className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">No Attachments</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Upload File
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Area */}
        <div className="flex-1 bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2 text-gray-600 text-sm">
                <span>Leads</span>
                <span>/</span>
                <span className="text-gray-900">Mr parji pajri</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">CRM-LEAD-2025-00002</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-gray-900">Mr parji pajri</h1>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <Link2 className="w-5 h-5 text-gray-400" />
                  <Paperclip className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700">
                  <option>Assign to</option>
                </select>
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 flex items-center space-x-2 hover:bg-gray-50"
                  >
                    <div className={`w-2 h-2 rounded-full ${statusOptions.find(s => s.name === selectedStatus)?.color}`}></div>
                    <span>{selectedStatus}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        {statusOptions.map((status) => (
                          <button
                            key={status.name}
                            onClick={() => {
                              setSelectedStatus(status.name);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                            <span>{status.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800">
                  Convert to Deal
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-0 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab.name === activeTab
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content Based on Active Tab */}
          {renderTabContent()}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          {/* Header Icons */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-700">M</span>
            </div>
            <div className="flex space-x-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <Link2 className="w-5 h-5 text-gray-400" />
              <Paperclip className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Details Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Details</h3>
              <Edit className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Organization</span>
                <span className="text-sm text-gray-900 font-medium">solution</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Website</span>
                <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">Add Website...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Territory</span>
                <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">Add Territory...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Industry</span>
                <span className="text-sm text-gray-900 font-medium">Technology</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Job Title</span>
                <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">Add Job Title...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Source</span>
                <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">Add Source...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lead Owner</span>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">A</span>
                  <span className="text-sm text-gray-900 font-medium">Administrator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Person Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Person</h3>
              <Edit className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Salutation</span>
                <span className="text-sm text-gray-900 font-medium">Mr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">First Name</span>
                <span className="text-sm text-gray-900 font-medium">parji</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Name</span>
                <span className="text-sm text-gray-900 font-medium">pajri</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">parji@gmail.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mobile No</span>
                <span className="text-sm text-gray-900 font-medium">083393933</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}