import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCircle,
  ChevronDown,
  Bell,
  BarChart3,
  Users,
  Handshake,
  CheckSquare,
  FileText,
  FileSignature,
  LineChart
} from 'lucide-react';

const ContactDetailPage = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sample contact data
  const contact = {
    id: 1,
    salutation: "Add Salutation...",
    firstName: "Angela",
    lastName: "Bower",
    email: "jabari.beard@outlook.com",
    mobile: "+12295552233",
    gender: "Add Gender...",
    organization: "Shriram Finance Ltd.",
    designation: "Product Manager",
    address: "Add Address...",
    avatar: "/api/placeholder/80/80",
    deals: [
      {
        id: 1,
        organization: "Shriram Finance Ltd.",
        amount: "$0.00",
        status: "Qualification",
        email: "jabari.beard@outlook.com",
        mobile: "+12295552233",
        owner: "Ankush Menat",
        lastModified: "11 months ago"
      }
    ]
  };

  const menuItems = [
    { icon: Bell, label: "Notifications", active: false },
    { icon: BarChart3, label: "Dashboard", active: false },
    { icon: Users, label: "Leads", active: false },
    { icon: Handshake, label: "Deals", active: false },
    { icon: CheckSquare, label: "Tasks", active: false },
    { icon: Mail, label: "Contacts", active: true },
    { icon: Building2, label: "Organizations", active: false },
    { icon: FileText, label: "Quotations", active: false },
    { icon: FileSignature, label: "Contracts", active: false },
    { icon: LineChart, label: "Reports", active: false }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isMinimized ? 'w-16' : 'w-64'} bg-slate-800 text-white transition-all duration-300 fixed h-full z-30`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute -right-3 top-6 bg-slate-800 border border-slate-600 text-white rounded-full p-1 hover:bg-slate-700 transition-colors z-20"
        >
          {isMinimized ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700 relative">
          {!isMinimized ? (
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex flex-col items-start gap-2"
            >
              <div className="text-white text-lg font-bold flex items-center">
                <div className="w-8 h-8 bg-pink-600 rounded mr-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                CRM
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 leading-tight flex items-center gap-1">
                  Administrator <ChevronDown size={14} />
                </p>
              </div>
            </button>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-pink-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
            </div>
          )}

          {/* Dropdown */}
          {isDropdownOpen && !isMinimized && (
            <div className="absolute left-4 mt-2 w-52 bg-white text-sm text-slate-800 rounded-md shadow-md z-50 border border-slate-200">
              <ul className="py-1">
                <li>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100">
                    Toggle Theme
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100">
                    Settings
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100">
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-3">
          <ul className="space-y-1 px-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index}>
                  <div
                    className={`w-full flex items-center ${
                      isMinimized ? 'justify-center px-2' : 'space-x-3 px-3'
                    } py-2.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                      item.active
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
                    }`}
                    title={isMinimized ? item.label : undefined}
                  >
                    <Icon size={18} />
                    {!isMinimized && <span>{item.label}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">Loved the demo?</p>
            {!isMinimized && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Try Frappe CRM for free with a 14-day trial.</p>
                <button className="text-xs text-blue-400 hover:underline mb-2 block">Sign up now</button>
                <p className="text-xs text-slate-400 mb-1">Getting started</p>
                <p className="text-xs text-slate-400">6/9 steps</p>
                <button className="text-xs text-blue-400 hover:underline">Continue</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Contacts /</span>
              <span className="text-sm text-gray-900">Angela Bower</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Contact Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src="/api/placeholder/64/64"
                      alt="Contact Avatar"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </h1>
                      <p className="text-gray-600 flex items-center mt-1">
                        <Building2 className="w-4 h-4 mr-1" />
                        {contact.organization}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors flex items-center space-x-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex gap-6">
              {/* Details Section - Left Side */}
              <div className="flex-1 max-w-2xl">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Details</h2>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Row 1 */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Salutation
                          </label>
                          <p className="text-sm text-gray-500 py-2 border-b border-dashed border-gray-300 cursor-pointer hover:text-gray-700">
                            {contact.salutation}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <p className="text-sm text-gray-900 py-2">
                            {contact.firstName}
                          </p>
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <p className="text-sm text-gray-900 py-2">
                            {contact.lastName}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <p className="text-sm text-blue-600 py-2 hover:underline cursor-pointer">
                            {contact.email}
                          </p>
                        </div>
                      </div>

                      {/* Row 3 */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile No
                          </label>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-900 py-2">
                              {contact.mobile}
                            </p>
                            <button className="text-gray-400 hover:text-gray-600">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <p className="text-sm text-gray-500 py-2 border-b border-dashed border-gray-300 cursor-pointer hover:text-gray-700">
                            {contact.gender}
                          </p>
                        </div>
                      </div>

                      {/* Row 4 */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organization
                          </label>
                          <p className="text-sm text-gray-900 py-2">
                            {contact.organization}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Designation
                          </label>
                          <p className="text-sm text-gray-900 py-2">
                            {contact.designation}
                          </p>
                        </div>
                      </div>

                      {/* Row 5 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <p className="text-sm text-gray-500 py-2 border-b border-dashed border-gray-300 cursor-pointer hover:text-gray-700">
                          {contact.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deals Section - Right Side */}
              <div className="w-96">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        Deals
                        <span className="ml-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {contact.deals.length}
                        </span>
                      </h2>
                    </div>
                  </div>
                  
                  {/* Table Header */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div>Organization</div>
                      <div>Amount</div>
                      <div>Status</div>
                      <div>Email</div>
                      <div>Mobile no</div>
                    </div>
                  </div>

                  {/* Additional Headers */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      <div>Deal owner</div>
                      <div>Last modified</div>
                    </div>
                  </div>
                  
                  {/* Deal Row */}
                  <div className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
                    <div className="space-y-2">
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-blue-600">$</span>
                          <span className="text-gray-900 text-xs">{contact.deals[0].organization}</span>
                        </div>
                        <div className="text-gray-900 text-xs">{contact.deals[0].amount}</div>
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                            ⚪ {contact.deals[0].status}
                          </span>
                        </div>
                        <div className="text-blue-600 text-xs hover:underline cursor-pointer">
                          {contact.deals[0].email}
                        </div>
                        <div className="text-gray-900 text-xs flex items-center">
                          📞 {contact.deals[0].mobile}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            A
                          </div>
                          <span className="text-gray-900 text-xs">{contact.deals[0].owner}</span>
                        </div>
                        <div className="text-gray-500 text-xs">{contact.deals[0].lastModified}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailPage;