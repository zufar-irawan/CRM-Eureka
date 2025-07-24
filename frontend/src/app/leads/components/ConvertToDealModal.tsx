"use client";

import { X } from "lucide-react";

interface ConvertToDealModalProps {
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
}

export default function ConvertToDealModal({
  onClose,
  onConfirm,
  selectedCount,
}: ConvertToDealModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-4">Convert to Deal</h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-sm text-gray-700 mb-6">
          Are you sure you want to convert {selectedCount} Lead
          {selectedCount > 1 ? "s" : ""} to Deal{selectedCount > 1 ? "s" : ""}?
        </p>

        <button
          onClick={onConfirm}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
        >
          Convert
        </button>
      </div>
    </div>
  );
}
