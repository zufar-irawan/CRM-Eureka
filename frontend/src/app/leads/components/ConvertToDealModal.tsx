// Fixed ConvertToDealModal.tsx with better error handling

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
  { value: "qualified", label: "Qualified" },
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
  const [dealValue, setDealValue] = useState<string>(""); 
  const [dealStage, setDealStage] = useState("proposal");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!dealTitle.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: "Please enter a deal title"
      });
      return;
    }

    // Convert and validate deal value
    let numericValue = 0;
    if (dealValue !== "" && dealValue.trim() !== "") {
      const parsedValue = parseFloat(dealValue);
      if (isNaN(parsedValue) || parsedValue < 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: "Deal value must be a valid positive number"
        });
        return;
      }
      numericValue = parsedValue;
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
          let errorMsg = "Unknown error";
          
          if (error instanceof Error) {
            errorMsg = error.message;
          } else if (typeof error === 'string') {
            errorMsg = error;
          } else if (error && typeof error === 'object' && 'message' in error) {
            errorMsg = String(error.message);
          }

          console.error(`❌ Error converting lead ${leadId}:`, error);
          results.push({
            leadId,
            success: false,
            error: errorMsg,
          });
        }
      }

      // Process results
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      console.log(`[DEBUG] Conversion summary: ${successCount} success, ${failureCount} failed`);

      if (successCount > 0) {
        // Show success message
        if (successCount === selectedCount) {
          await Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `Successfully converted ${successCount} lead${successCount > 1 ? 's' : ''} to deal${successCount > 1 ? 's' : ''}!`,
            timer: 3000,
            showConfirmButton: true
          });
        } else {
          // Partial success
          const failedLeads = results.filter(r => !r.success);
          const errorMessages = failedLeads.map(r => `Lead ${r.leadId}: ${r.error}`).join('\n');
          
          await Swal.fire({
            icon: 'warning',
            title: 'Partial Success',
            html: `
              <div>
                <p><strong>Successfully converted:</strong> ${successCount} lead${successCount > 1 ? 's' : ''}</p>
                <p><strong>Failed conversions:</strong> ${failureCount}</p>
                ${failureCount > 0 ? `<details><summary>Error details</summary><pre style="text-align: left; font-size: 12px;">${errorMessages}</pre></details>` : ''}
              </div>
            `,
            showConfirmButton: true
          });
        }

        // Close modal after successful conversion(s)
        onClose();
      } else {
        // No conversions succeeded
        const firstError = results.find(r => r.error)?.error || "All conversions failed";
        
        await Swal.fire({
          icon: 'error',
          title: 'Conversion Failed',
          html: `
            <div>
              <p>All lead conversions failed.</p>
              <details>
                <summary>Error details</summary>
                <pre style="text-align: left; font-size: 12px;">${results.map(r => `Lead ${r.leadId}: ${r.error}`).join('\n')}</pre>
              </details>
            </div>
          `,
          showConfirmButton: true
        });
      }

    } catch (error) {
      console.error("Error in conversion process:", error);

      let errorMsg = "Unknown error occurred during conversion";
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Conversion Error',
        text: errorMsg,
        showConfirmButton: true
      });

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
              Deal Value (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={dealValue}
                onChange={handleDealValueChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave empty for 0.00</p>
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