"use client"

import { useEffect, useState } from 'react';
import {
    RotateCcw,
    Filter,
    ArrowUpDown,
    Columns,
    MoreHorizontal,
    Phone,
    Mail,
    User,
    Building2
} from 'lucide-react'
import axios from 'axios';

export default function MainLeads() {
    const [leads, setLeads] = useState([])

    useEffect(() => {
        axios.get("http://localhost:5000/api/leads")
            .then((res) => {
                setLeads(res.data)
            })
            .catch((err) => {
                alert(err)
            })
    }, [])

    return (
        <main className="p-4 overflow-auto lg:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <RotateCcw className="w-4 h-4" />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="hidden sm:inline">Sort</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <Columns className="w-4 h-4" />
                            <span className="hidden sm:inline">Columns</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile No</th>
                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th> */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leads.map((lead: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.company}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {lead.stage}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.mobile}</td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                                                    <span className="text-xs font-medium text-purple-600">{contact.assignedTo.avatar}</span>
                                                </div>
                                                <span className="text-sm text-gray-900">{contact.assignedTo.name}</span>
                                            </div>
                                        </td> */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.updated_at}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="lg:hidden space-y-4">
                    {leads.map((lead: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3" />
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">{lead.fullname}</h3>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Building2 className="w-3 h-3 mr-1" />
                                            {lead.company}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {lead.stage}
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {lead.email}
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {lead.mobile}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                {/* <div className="flex items-center">
                                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                                                <span className="text-xs font-medium text-purple-600">{contact.assignedTo.avatar}</span>
                                            </div>
                                            <span className="text-sm text-gray-600">{contact.assignedTo.name}</span>
                                        </div> */}
                                <span className="text-xs text-gray-500">{lead.updated_at}</span>
                            </div>
                        </div>
                    )
                    )}

                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{' '}
                        <span className="font-medium">3</span> results
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            1
                        </button>
                        <button className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}