// File: ConvertToDealModal.tsx - Fixed implementation

"use client";

import { useState } from "react";
import {
  X,
  ArrowRight,
  Building,
  User,
  DollarSign,
  Target,
} from "lucide-react";

interface ConvertToDealModalProps {
  onClose: () => void;
  onConfirm: (
    leadId: string,
    dealTitle: string,
    dealValue: number,
    dealStage: string
  ) => Promise<any>;
  selectedCount: number;
  selectedIds: string[];
}

interface ConversionResult {
  leadId: string;
  success: boolean;
  error?: string;
}

const dealStages = [
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export default function ConvertToDealModal({
  onClose,
  onConfirm,
  selectedCount,
  selectedIds,
}: ConvertToDealModalProps) {
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState<string>(""); // Changed to string for better input handling
  const [dealStage, setDealStage] = useState("proposal");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dealTitle.trim()) {
      alert("Please enter a deal title");
      return;
    }

    const numericValue = dealValue === "" ? 0 : parseFloat(dealValue);

    if (isNaN(numericValue) || numericValue < 0) {
      alert("Deal value must be a valid positive number");
      return;
    }

    console.log("[DEBUG] Modal values before submit:", {
      dealTitle,
      dealValue,
      numericValue,
      dealStage,
      selectedIds,
    });

    setIsLoading(true);
    const results: ConversionResult[] = [];

    try {
      // Convert each lead individually
      for (const leadId of selectedIds) {
        try {
          console.log(`[DEBUG] Converting lead ${leadId}...`);

          const result = await onConfirm(
            leadId,
            selectedCount === 1 ? dealTitle : `${dealTitle} - Lead ${leadId}`,
            numericValue,
            dealStage
          );

          console.log(`[DEBUG] Conversion result for lead ${leadId}:`, result);

          if (result && result.success && result.data) {
            results.push({
              leadId,
              success: true,
            });
            console.log(`✅ Lead ${leadId} converted successfully`);
          } else {
            const errorMsg = result?.message || "Unknown error occurred";
            results.push({
              leadId,
              success: false,
              error: errorMsg,
            });
            console.error(`❌ Lead ${leadId} conversion failed:`, errorMsg);
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`❌ Error converting lead ${leadId}:`, error);
          results.push({
            leadId,
            success: false,
            error: errorMsg,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      console.log(
        `[DEBUG] Conversion summary: ${successCount} success, ${failureCount} failed`
      );

      if (successCount > 0) {
        const dealValueDisplay =
          numericValue > 0
            ? ` with value ${numericValue.toLocaleString("en-US")}`
            : "";

        if (successCount === selectedCount) {
          alert(
            `🎉 Successfully converted ${successCount} lead${
              successCount > 1 ? "s" : ""
            } to deal${successCount > 1 ? "s" : ""}${dealValueDisplay}!`
          );
        } else {
          alert(
            `Partially successful: ${successCount} converted, ${failureCount} failed`
          );
        }

        onClose();
      } else {
        const firstError =
          results.find((r) => r.error)?.error || "All conversions failed";
        alert(`Conversion failed: ${firstError}`);
      }
    } catch (error) {
      console.error("Error in conversion process:", error);
      alert(
        "Error: " + (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDealValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string, numbers, and decimal points
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDealValue(value);
    }
  };

  const handleDealValueFocus = () => {
    // Clear the field if it's "0" when user focuses
    if (dealValue === "0") {
      setDealValue("");
    }
  };

  const handleDealValueBlur = () => {
    // If field is empty when user leaves, don't set it back to 0
    // Let it remain empty - the form will handle it as 0 when submitting
  };

  // Simple conversion form - no results screen
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
            Converting <strong>{selectedCount}</strong> lead
            {selectedCount > 1 ? "s" : ""} to deal{selectedCount > 1 ? "s" : ""}
          </p>
          {selectedCount <= 5 && (
            <p className="text-xs text-blue-600 mt-1">
              Lead IDs: {selectedIds.join(", ")}
            </p>
          )}
          <div className="mt-2 text-xs text-blue-700 space-y-1">
            <div className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              <span>
                Companies will be created automatically from company information
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>
                Contacts will be created automatically from personal information
              </span>
            </div>
          </div>
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
              placeholder={
                selectedCount === 1
                  ? "Deal from Lead Conversion"
                  : `Deal from ${selectedCount} Leads`
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Value
            </label>
            <input
              type="text"
              value={dealValue}
              onChange={handleDealValueChange}
              onFocus={handleDealValueFocus}
              onBlur={handleDealValueBlur}
              placeholder="0.00"
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

          <div className="flex gap-3 pt-4">
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
                  Convert{" "}
                  {selectedCount > 1 ? `${selectedCount} Leads` : "Lead"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
