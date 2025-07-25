"use client";

import { X, Trash2 } from "lucide-react";

interface DeleteLeadModalProps {
  selectedCount: number;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: () => void;
  type: "leads" | "deals";
}

export default function DeleteLeadModal({
  selectedCount,
  selectedIds,
  onClose,
  onConfirm,
  type,
}: DeleteLeadModalProps) {
  const itemType = type === "leads" ? "Lead" : "Deal";
  const itemTypePlural = type === "leads" ? "Leads" : "Deals";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-4">Delete {selectedCount > 1 ? itemTypePlural : itemType}</h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-sm text-gray-700 mb-6">
          {selectedCount === 1 ? (
            <>
              Are you sure you want to delete this {itemType.toLowerCase()}?
            </>
          ) : (
            <>
              Are you sure you want to delete <strong>{selectedCount}</strong> {itemTypePlural.toLowerCase()}?
            </>
          )}
        </p>

        {selectedCount <= 5 && (
          <div className="mb-4 text-xs text-gray-500">
            <p className="font-medium mb-1">Selected IDs:</p>
            <p className="break-all">{selectedIds.join(", ")}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}