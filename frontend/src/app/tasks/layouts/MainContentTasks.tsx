"use client";

import { useState } from "react";
import { 
  ChevronDown, 
  RefreshCw, 
  Filter, 
  ArrowUpDown, 
  Columns3,
  MoreHorizontal,
  Calendar,
  User
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: "Backlog" | "In Progress" | "Done" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Urgent";
  dueDate: string | null;
  assignedTo: string;
  lastModified: string;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "assalamualaikum",
    status: "Backlog",
    priority: "Low",
    dueDate: null,
    assignedTo: "Administrator",
    lastModified: "yesterday"
  },
  {
    id: "2",
    title: "Review quarterly reports",
    status: "In Progress",
    priority: "High",
    dueDate: "2025-07-30",
    assignedTo: "John Doe",
    lastModified: "2 hours ago"
  },
  {
    id: "3",
    title: "Update documentation",
    status: "Done",
    priority: "Medium",
    dueDate: "2025-07-25",
    assignedTo: "Jane Smith",
    lastModified: "1 day ago"
  }
];

export default function MainTasks() {
  const [selectedStatus, setSelectedStatus] = useState("Status");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Backlog":
        return "text-gray-600";
      case "In Progress":
        return "text-blue-600";
      case "Done":
        return "text-green-600";
      case "Cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "text-gray-500";
      case "Medium":
        return "text-yellow-600";
      case "High":
        return "text-orange-600";
      case "Urgent":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleAllTasks = () => {
    setSelectedTasks(
      selectedTasks.length === mockTasks.length
        ? []
        : mockTasks.map(task => task.id)
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Filters Bar */}
      <div className="p-4 pl-8 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              {selectedStatus}
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            
            {isStatusOpen && (
              <div className="absolute top-10 left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-md z-10">
                <ul className="text-sm text-gray-700">
                  {["Status", "Backlog", "In Progress", "Done", "Cancelled"].map((status) => (
                    <li key={status}>
                      <button
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsStatusOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        {status}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex-1"></div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <RefreshCw size={16} className="text-gray-500" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-sm">
                <Filter size={16} className="text-gray-500" />
                Filter
                </button>
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-sm">
              <ArrowUpDown size={16} className="text-gray-500" />
              Sort
            </button>
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-sm">
              <Columns3 size={16} className="text-gray-500" />
              Columns
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md">
              <MoreHorizontal size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === mockTasks.length}
                  onChange={toggleAllTasks}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Title</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Priority</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Due Date</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Assigned To</th>
              <th className="text-left p-4 text-sm font-medium text-gray-700">Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {mockTasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="p-4 text-sm text-gray-900">{task.title}</td>
                <td className="p-4">
                  <span className={`text-sm ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-700">
                  {task.dueDate ? (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {task.dueDate}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-300" />
                      <span className="text-gray-400">-</span>
                    </div>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    {task.assignedTo}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500">{task.lastModified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 pl-8 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select className="border border-gray-300 rounded px-3 py-1 text-sm">
              <option>20</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            1 of {mockTasks.length}
          </div>
        </div>
      </div>
    </div>
  );
}