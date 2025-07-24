"use client";

import { X, Trash2 } from "lucide-react";

interface DeleteLeadModalProps {
  leadId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteLeadModal({
  leadId,
  onClose,
  onConfirm,
}: DeleteLeadModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-4">Delete</h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-sm text-gray-700 mb-6">
          Are you sure you want to delete CRM Lead – <strong>{leadId}</strong>?
        </p>

        <button
          onClick={onConfirm}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
