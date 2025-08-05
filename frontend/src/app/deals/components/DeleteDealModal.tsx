"use client";

import { X, Trash2 } from "lucide-react";

interface DeleteDealModalProps {
  selectedCount: number;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteDealModal({
  selectedCount,
  selectedIds,
  onClose,
  onConfirm,
}: DeleteDealModalProps) {
  const itemType = "Deal";
  const itemTypePlural = "Deals";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Delete {selectedCount > 1 ? itemTypePlural : itemType}
            </h2>
            <p className="text-sm text-gray-500">
              This action cannot be undone
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-700 mb-4">
            {selectedCount === 1 ? (
              <>
                Are you sure you want to delete this {itemType.toLowerCase()}?
              </>
            ) : (
              <>
                Are you sure you want to delete <strong>{selectedCount}</strong>{" "}
                {itemTypePlural.toLowerCase()}?
              </>
            )}
          </p>

          {selectedCount <= 5 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Selected IDs:
              </p>
              <p className="text-xs break-all text-gray-700">
                {selectedIds.join(", ")}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}