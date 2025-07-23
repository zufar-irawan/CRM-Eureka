import { useState } from 'react';
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
} from 'lucide-react';

type Contact = {
    id: number;
    name: string;
    organization: string;
    status: string;
    email: string;
    mobile: string;
    assignedTo: {
        name: string;
        avatar: string;
    };
    lastModified: string;
    statusColor: 'orange' | 'gray' | 'green';
};

export default function MainLeads() {
    const [contacts] = useState<Contact[]>([
        {
            id: 1,
            name: "Mr John Smith",
            organization: "Acme Corporation",
            status: "Contacted",
            email: "john.smith@acme.com",
            mobile: "01234567890",
            assignedTo: {
                name: "Sarah Wilson",
                avatar: "SW"
            },
            lastModified: "2 hours ago",
            statusColor: "orange"
        },
        {
            id: 2,
            name: "Ms Emily Johnson",
            organization: "Tech Solutions Ltd.",
            status: "New",
            email: "emily.johnson@techsol.com",
            mobile: "09876543210",
            assignedTo: {
                name: "Mike Davis",
                avatar: "MD"
            },
            lastModified: "5 hours ago",
            statusColor: "gray"
        },
        {
            id: 3,
            name: "Mr David Brown",
            organization: "Global Industries",
            status: "Qualified",
            email: "david.brown@global.com",
            mobile: "01122334455",
            assignedTo: {
                name: "Lisa Chen",
                avatar: "LC"
            },
            lastModified: "1 day ago",
            statusColor: "green"
        }
    ]);

    const getStatusBadge = (status: string, color: 'orange' | 'gray' | 'green') => {
        const colorClasses: Record<typeof color, string> = {
            orange: "bg-orange-100 text-orange-800 border-orange-200",
            gray: "bg-gray-100 text-gray-800 border-gray-200",
            green: "bg-green-100 text-green-800 border-green-200"
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[color]}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${color === 'orange' ? 'bg-orange-500' : color === 'green' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                {status}
            </span>
        );
    };


    return (
        <main className="p-4 overflow-auto lg:p-6 bg-gray-50]">
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.organization}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(contact.status, contact.statusColor)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.mobile}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                                                <span className="text-xs font-medium text-purple-600">{contact.assignedTo.avatar}</span>
                                            </div>
                                            <span className="text-sm text-gray-900">{contact.assignedTo.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.lastModified}</td>
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
                    {contacts.map((contact) => (
                        <div key={contact.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3" />
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">{contact.name}</h3>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Building2 className="w-3 h-3 mr-1" />
                                            {contact.organization}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(contact.status, contact.statusColor)}
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {contact.email}
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {contact.mobile}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                                        <span className="text-xs font-medium text-purple-600">{contact.assignedTo.avatar}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">{contact.assignedTo.name}</span>
                                </div>
                                <span className="text-xs text-gray-500">{contact.lastModified}</span>
                            </div>
                        </div>
                    ))}
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