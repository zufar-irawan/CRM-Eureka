"use client";

import { useState } from "react";
import { X, ArrowRight } from "lucide-react";

interface ConvertToDealModalProps {
  onClose: () => void;
  onConfirm: (dealTitle: string, dealValue: number, dealStage: string) => void; 
  selectedCount: number;
  selectedIds: string[];
}

const dealStages = [
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" }
];

export default function ConvertToDealModal({
  onClose,
  onConfirm,
  selectedCount,
  selectedIds,
}: ConvertToDealModalProps) {
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState<number>(0);
  const [dealStage, setDealStage] = useState("proposal");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dealTitle.trim()) {
      alert("Please enter a deal title");
      return;
    }

    if (dealValue < 0) {
      alert("Deal value cannot be negative");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(dealTitle, dealValue, dealStage);
    } catch (error) {
      console.error("Error converting leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold">Convert to Deal</h2>
          <ArrowRight className="w-5 h-5 text-blue-600" />
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Converting <strong>{selectedCount}</strong> lead{selectedCount > 1 ? "s" : ""} to deal{selectedCount > 1 ? "s" : ""}
          </p>
          {selectedCount <= 5 && (
            <p className="text-xs text-blue-600 mt-1">
              Lead IDs: {selectedIds.join(", ")}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              placeholder={selectedCount === 1 ? "Deal from Lead" : `Deal from ${selectedCount} Leads`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Value ($)
            </label>
            <input
              type="number"
              value={dealValue}
              onChange={(e) => setDealValue(Number(e.target.value))}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Stage
            </label>
            <select
              value={dealStage}
              onChange={(e) => setDealStage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              {dealStages.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Converting...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Convert {selectedCount > 1 ? `${selectedCount} Leads` : "Lead"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}