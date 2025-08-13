"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../leads/detail/[id]/hooks/useAuth";
import { useTaskDetail } from "./hooks/useTaskDetail";
import TaskHeader from "./components/TaskHeader";
import TaskSidebar from "./components/TaskSidebar";
import TaskCommentsTab from "./components/TaskCommentsTab";
import TaskResultsTab from "./components/TaskResultsTab";
import { MessageSquare, FileText, Paperclip } from "lucide-react";

const TASK_TABS = [
  { name: "Comments", icon: MessageSquare },
  { name: "Results", icon: FileText },
  { name: "Attachments", icon: Paperclip }
];

export default function TaskDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Comments");
  
  const { currentUser, userLoading } = useAuth();
  const { 
    task, 
    error, 
    isLoading,
    fetchTask, 
    refreshTask, 
    updateTaskStatus,
    updateTaskAssignment,
    setTask 
  } = useTaskDetail(id);

  useEffect(() => {
    if (!userLoading) {
      fetchTask();
    }
  }, [id, userLoading, fetchTask]);

  const renderTabContent = () => {
    if (!task) return null;

    switch (activeTab) {
      case "Comments":
        return <TaskCommentsTab taskId={id} currentUser={currentUser} />;
      case "Results":
        return <TaskResultsTab taskId={id} currentUser={currentUser} />;
      default:
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">
              {activeTab} content for {task.title}
            </h3>
          </div>
        );
    }
  };

  if (userLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      <div className="flex-1 bg-white">
        <TaskHeader
          task={task}
          isLoading={isLoading}
          onTaskUpdate={refreshTask}
          onStatusChange={updateTaskStatus}
          onAssignmentChange={updateTaskAssignment}
        />

        {/* Task Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-0 px-6">
            {TASK_TABS.map((tab) => (
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

        {renderTabContent()}
      </div>

      <TaskSidebar
        task={task}
        currentUser={currentUser}
      />
    </div>
  );
}