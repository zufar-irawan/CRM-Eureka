// File: ConvertToDealModal.tsx - Simplified implementation

"use client";

import { useState } from "react";
import { X, ArrowRight, Building, User, DollarSign, Target } from "lucide-react";
import Swal from "sweetalert2";

interface ConvertToDealModalProps {
  onClose: () => void;
  onConfirm: (leadId: string, dealTitle: string, dealValue: number, dealStage: string) => Promise<any>;
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
  { value: "lost", label: "Lost" }
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
      Swal.fire({
        icon: 'warning',
        text: "Please enter a deal title"
      })
      return;
    }

    if (dealValue < 0) {
      Swal.fire({
        icon: 'warning',
        text: "Deal value cannot be negative"
      })

      return;
    }

    console.log('[DEBUG] Modal values before submit:', {
      dealTitle,
      dealValue,
      dealValueType: typeof dealValue,
      dealStage,
      selectedIds
    });

    setIsLoading(true);
    const results: ConversionResult[] = [];

    try {
      const numericValue = parseFloat(dealValue.toString());
      if (isNaN(numericValue)) {
        throw new Error("Invalid deal value");
      }

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
              success: true
            });
            console.log(`✅ Lead ${leadId} converted successfully`);
          } else {
            const errorMsg = result?.message || "Unknown error occurred";
            results.push({
              leadId,
              success: false,
              error: errorMsg
            });
            console.error(`❌ Lead ${leadId} conversion failed:`, errorMsg);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          console.error(`❌ Error converting lead ${leadId}:`, error);
          results.push({
            leadId,
            success: false,
            error: errorMsg
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      console.log(`[DEBUG] Conversion summary: ${successCount} success, ${failureCount} failed`);

      if (successCount > 0) {
        // Show success message and close modal
        if (successCount === selectedCount) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `🎉 Successfully converted ${successCount} lead${successCount > 1 ? 's' : ''} to deal${successCount > 1 ? 's' : ''}!`
          })

        } else {
          Swal.fire({
            icon: 'info',
            title: 'Information',
            text: `Partially successful: ${successCount} converted, ${failureCount} failed`
          })

        }

        // Close modal after successful conversion
        onClose();
      } else {
        // If no conversions succeeded, show error message
        const firstError = results.find(r => r.error)?.error || "All conversions failed";

        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: `Conversion failed: ${firstError}`
        })
      }

    } catch (error) {
      console.error("Error in conversion process:", error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error: " + (error instanceof Error ? error.message : "Unknown error")
      })

    } finally {
      setIsLoading(false);
    }
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
            Converting <strong>{selectedCount}</strong> lead{selectedCount > 1 ? "s" : ""} to deal{selectedCount > 1 ? "s" : ""}
          </p>
          {selectedCount <= 5 && (
            <p className="text-xs text-blue-600 mt-1">
              Lead IDs: {selectedIds.join(", ")}
            </p>
          )}
          <div className="mt-2 text-xs text-blue-700 space-y-1">
            <div className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              <span>Companies will be created automatically from company information</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Contacts will be created automatically from personal information</span>
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
              placeholder={selectedCount === 1 ? "Deal from Lead Conversion" : `Deal from ${selectedCount} Leads`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Value ($)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={dealValue || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? 0 : parseFloat(value);
                  setDealValue(isNaN(numValue) ? 0 : numValue);
                }}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
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