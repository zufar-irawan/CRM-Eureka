"use client";

import { MoreHorizontal, X } from "lucide-react";
import { useState } from "react";

interface SelectedActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export default function SelectedActionBar({
  selectedCount,
  onClearSelection,
}: SelectedActionBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="w-full px-2 mt-40 pointer-events-none">
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
                      alert("Edit clicked");
                      setShowDropdown(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      alert("Delete clicked");
                      setShowDropdown(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      alert("Convert to Deal clicked");
                      setShowDropdown(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-blue-600 hover:bg-gray-100"
                  >
                    Convert to Deal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
