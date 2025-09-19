/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  FileText,
  Download,
  Eye,
  Image,
  Video,
  Music,
  File,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { TaskResult, CurrentUser, TaskAttachment } from "../types";
import { getFirstChar, formatBytes } from "../utils/formatting";
import {
  RESULT_TYPES,
  makeAuthenticatedRequest,
  TASK_API_ENDPOINTS,
} from "../utils/constants";
import Swal from "sweetalert2";

type ResultType = (typeof RESULT_TYPES)[number]["value"];

interface TaskResultItemProps {
  result: TaskResult;
  currentUser: CurrentUser | null;
  onUpdate: () => void;
  onDelete: () => void;
  attachments?: TaskAttachment[];
}

export default function TaskResultItem({
  result,
  currentUser,
  onUpdate,
  onDelete,
  attachments = [],
}: TaskResultItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(result.result_text);
  const [editType, setEditType] = useState<ResultType>(
    (result.result_type as ResultType) || "note"
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] =
    useState<TaskAttachment | null>(null);
  const [showAllAttachments, setShowAllAttachments] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [previewImage]);

  // Keyboard navigation - Add this useEffect for ESC key:
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && previewImage) {
        setPreviewImage(null);
        setPreviewAttachment(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewImage]);

  const canEdit =
    currentUser?.id === result.created_by || currentUser?.role === "admin";
  const canDelete =
    currentUser?.id === result.created_by || currentUser?.role === "admin";

  const groupedAttachments = {
    images: attachments.filter((att) => att.file_type === "image"),
    documents: attachments.filter((att) => att.file_type === "document"),
    videos: attachments.filter((att) => att.file_type === "video"),
    audio: attachments.filter((att) => att.file_type === "audio"),
    others: attachments.filter(
      (att) => !["image", "document", "video", "audio"].includes(att.file_type)
    ),
  };

  const getResultTypeInfo = (type: string) => {
    const typeInfo = RESULT_TYPES.find((t) => t.value === type);
    return typeInfo || RESULT_TYPES.find((t) => t.value === "note")!;
  };

  const getFileTypeIcon = (fileType: TaskAttachment["file_type"]) => {
    switch (fileType) {
      case "image":
        return Image;
      case "document":
        return FileText;
      case "video":
        return Video;
      case "audio":
        return Music;
      default:
        return File;
    }
  };

  const getFileTypeColor = (fileType: TaskAttachment["file_type"]) => {
    switch (fileType) {
      case "image":
        return "bg-green-100 text-green-700 border-green-300";
      case "document":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "video":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "audio":
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Function to get the correct image URL - FIXED
  const getImageUrl = (attachment: TaskAttachment): string => {
    // Try multiple URL formats
    const possibleUrls = [
      attachment.view_url,
      `/api/tasks/attachments/${attachment.id}/view`,
      `http://localhost:5000/api/tasks/attachments/${attachment.id}/view`,
      attachment.file_path
        ? `http://localhost:5000${attachment.file_path}`
        : null,
    ].filter(Boolean);

    return possibleUrls[0] || "";
  };

  const handleImageError = (attachmentId: number) => {
    setImageErrors((prev) => new Set(prev).add(attachmentId));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(result.result_text);
    setEditType((result.result_type as ResultType) || "note");
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    setIsUpdating(true);
    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.RESULT_UPDATE(String(result.id)),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            result_text: editText.trim(),
            result_type: editType,
            credentials: "include",
          }),
        }
      );

      if (response.ok) {
        setIsEditing(false);
        onUpdate();

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Result updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to update result");
      }
    } catch (error) {
      console.error("Error updating result:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update result. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    const deleteConfirmation = await Swal.fire({
      title: "Delete Result?",
      text: "Are you sure you want to delete this result? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!deleteConfirmation.isConfirmed) return;

    setIsDeleting(true);
    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.RESULT_UPDATE(String(result.id)),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        onDelete();

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Result has been deleted successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to delete result");
      }
    } catch (error) {
      console.error("Error deleting result:", error);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Failed to delete result. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = (attachment: TaskAttachment) => {
    const link = document.createElement("a");
    link.href = `/api/tasks/attachments/${attachment.id}/download`;
    link.download = attachment.original_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (attachment: TaskAttachment) => {
    if (attachment.view_url) {
      window.open(attachment.view_url, "_blank");
    }
  };

  const handleImagePreview = (attachment: TaskAttachment) => {
    if (attachment.file_type === "image") {
      const imageUrl = getImageUrl(attachment);
      setPreviewImage(imageUrl);
      setPreviewAttachment(attachment);
    }
  };

  const typeInfo = getResultTypeInfo(result.result_type || "note");

  // Calculate total attachments size
  const totalSize = attachments.reduce((sum, att) => sum + att.file_size, 0);

  // Show preview for first few images, with option to show all
  const previewImages = showAllAttachments
    ? groupedAttachments.images
    : groupedAttachments.images.slice(0, 6);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-start space-x-4">
          {/* Type Icon */}
          <div
            className={`w-10 h-10 ${typeInfo.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}
          >
            <typeInfo.icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${typeInfo.bgColor} ${typeInfo.textColor} shadow-sm`}
                >
                  {typeInfo.label}
                </span>
                <span className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(result.result_date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    })}
                  </span>
                </span>
                {result.created_by_name && (
                  <span className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {getFirstChar(result.created_by_name)}
                      </span>
                    </div>
                    <span>{result.created_by_name}</span>
                  </span>
                )}
              </div>

              {/* Actions Menu */}
              {(canEdit || canDelete) && (
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isDeleting}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {showActions && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowActions(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <div className="py-1">
                          {canEdit && (
                            <button
                              onClick={handleEdit}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={handleDelete}
                              disabled={isDeleting}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <>
                                  <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin" />
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="space-y-4">
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as ResultType)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {RESULT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  placeholder="Describe the result or outcome..."
                />
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editText.trim() || isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {result.result_text}
              </div>
            )}

            {/* Consistent Attachments List */}
            {attachments && attachments.length > 0 && !isEditing && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                {/* <div className="flex items-center justify-between mb-4">
         
                  <h4 className="text-base font-semibold text-gray-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Attachments ({attachments.length})
                  </h4>
                  <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    {formatBytes(totalSize)}
                  </div>
                </div> */}

                <div className="space-y-2">
                  {attachments.map((attachment) => {
                    const FileIcon = getFileTypeIcon(attachment.file_type);
                    const colorClass = getFileTypeColor(attachment.file_type);

                    return (
                      <div key={attachment.id} className="group flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <FileIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{attachment.original_filename}</p>
                          <p className="text-xs text-gray-500">{formatBytes(attachment.file_size)}</p>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {attachment.view_url && (
                            <button onClick={() => handleView(attachment)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDownload(attachment)} className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-green-50" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Image Preview Modal with Blur Background */}
      {previewImage && previewAttachment && (
        <>
          {/* Blur Background Overlay */}
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={() => {
              setPreviewImage(null);
              setPreviewAttachment(null);
            }}
          />

          {/* Modal Content - Full Screen Image */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
            onClick={() => {
              setPreviewImage(null);
              setPreviewAttachment(null);
            }}
          >
            <img
              src={previewImage}
              alt={previewAttachment.original_filename}
              className="block max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              crossOrigin="anonymous"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
              onError={(e) => {
                console.error("Preview image failed to load:", previewImage);
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
