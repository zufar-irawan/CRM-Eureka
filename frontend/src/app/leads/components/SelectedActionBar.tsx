"use client";

import { useState } from "react";
import { MoreHorizontal, X } from "lucide-react";
import BulkEditModal from "./BulkEditModal";
import ConvertToDealModal from "./ConvertToDealModal";
import DeleteLeadModal from "./DeleteLeadModal";
import ModalPortal from "./ModalPortal";

interface SelectedActionBarProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onDelete?: (ids: string[]) => void;
  onUpdate?: (ids: string[], field: string, value: string) => void;
  onConvert?: (dealTitle: string, dealValue: number, dealStage: string) => void;
  type: "leads" | "deals";
}

export default function SelectedActionBar({
  selectedCount,
  selectedIds,
  onClearSelection,
  onDelete,
  onUpdate,
  onConvert,
  type,
}: SelectedActionBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleConvert = async (dealTitle: string, dealValue: number, dealStage: string) => {
    if (onConvert) {
      await onConvert(dealTitle, dealValue, dealStage);
    }
    setShowConvertModal(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(selectedIds);
    }
    setShowDeleteModal(false);
  };

  const handleBulkUpdate = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate(selectedIds, field, value);
    }
    setShowBulkEdit(false);
  };

  if (selectedCount === 0) return null;

  return (
    <div className="w-full px-2 mt-40 pointer-events-none z-[999]">
      <div className="relative w-full max-w-6xl mx-auto pointer-events-auto">
        <div className="bg-white border border-gray-200 shadow-md rounded-2xl px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-gray-800 font-medium">
            {selectedCount} row{selectedCount > 1 ? "s" : ""} selected
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={onClearSelection}
              className="text-gray-500 hover:text-red-600 transition p-1"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1.5 rounded hover:bg-gray-100 transition"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-700" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 bottom-full mb-2 w-44 bg-white border border-gray-200 rounded shadow-md z-50">
                  <button
                    onClick={() => {
                      setShowBulkEdit(true);
                      setShowDropdown(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowDropdown(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                  {type === "leads" && (
                    <button
                      onClick={() => {
                        setShowConvertModal(true);
                        setShowDropdown(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-gray-100"
                    >
                      Convert to Deal
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBulkEdit && (
        <ModalPortal>
          <BulkEditModal
            selectedCount={selectedCount}
            onClose={() => setShowBulkEdit(false)}
            onUpdate={handleBulkUpdate}
            type={type}
          />
        </ModalPortal>
      )}

      {showConvertModal && type === "leads" && (
        <ModalPortal>
          <ConvertToDealModal
            selectedCount={selectedCount}
            selectedIds={selectedIds}
            onClose={() => setShowConvertModal(false)}
            onConfirm={handleConvert}
          />
        </ModalPortal>
      )}

      {showDeleteModal && (
        <ModalPortal>
          <DeleteLeadModal
            selectedCount={selectedCount}
            selectedIds={selectedIds}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            type={type}
          />
        </ModalPortal>
      )}
    </div>
  );
}