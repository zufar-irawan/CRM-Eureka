"use client";

import Dropdown from "@/components/AddModal/Dropdown";
import Input from "@/components/AddModal/Input";
import NumericUpDown from "@/components/AddModal/NumericUpDown";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  deal: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDeal: any) => void;
}

export type DealsForm = {
  deal_id: number;
  title: string;
  value: number;
  stage: string;
  owner: number;
  id_contact: number;
  id_company: number;
  description: string;
}

export default function EditDealModal({ deal, isOpen, onClose, onSave }: Props) {
  const [form, setForm] = useState<DealsForm>({
    deal_id: 0,
    title: '',
    value: 0,
    stage: '',
    owner: 0,
    id_contact: 0,
    id_company: 0,
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (deal) {
      setForm({
        deal_id: deal.deal_id || 0,
        title: deal.title || '',
        value: deal.value || 0,
        stage: deal.stage || '',
        owner: deal.owner || 0,
        id_contact: deal.id_contact || 0,
        id_company: deal.id_company || 0,
        description: deal.description || '',
      });
    }
  }, [deal]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const submitData = {
        ...form,
        owner: form.owner
      };

      // Remove empty string values
      Object.keys(submitData).forEach(key => {
        if ((submitData as any)[key] === '') {
          delete (submitData as any)[key];
        }
      });

      console.log('Data to submit:', submitData);

      const response = await fetch(`http://localhost:5000/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update deal');
      }

      console.log('Deal updated successfully:', result);

      if (onSave) {
        onSave(result);
      }

      onClose();
    } catch (err) {
      console.error('Error updating deal:', err);
      setError(err instanceof Error ? err.message : 'Failed to update deal');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Transparent Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container - Positioned to center within main content area */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white w-full max-w-6xl rounded-xl shadow-2xl relative transform transition-all duration-300 max-h-[90vh] overflow-hidden pointer-events-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-800">Edit Deal</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form Container with Scroll */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Organization Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Deal Title"
                      isRequired={true}
                      name="title"
                      placeholder="Enter Deal Title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      maxLength={50}
                    />

                    <NumericUpDown
                      label="Deal Value"
                      isRequired={true}
                      name="value"
                      placeholder="0"
                      value={form.value}
                      onChange={handleChange}
                      min={1000}
                      max={1000000000}
                      step={500}
                      required
                      maxLength={255}
                    />

                    <Dropdown
                      label="Stage"
                      name="stage"
                      value={form.stage}
                      onChange={handleChange}
                      options={[
                        { value: "proposal", label: "Proposal" },
                        { value: "negotiation", label: "Negotiation" },
                        { value: "won", label: "Won" },
                        { value: "lost", label: "Lost" },
                      ]}
                    />

                    <Input
                      label="Deal ID"
                      isRequired={false}
                      name="deal_id"
                      placeholder="Deal ID"
                      value={form.deal_id.toString()}
                      onChange={handleChange}
                      maxLength={255}
                    />

                    <Input
                      label="Owner ID"
                      isRequired={false}
                      name="owner"
                      placeholder="Owner ID"
                      value={form.owner.toString()}
                      onChange={handleChange}
                      maxLength={255}
                    />

                    <Input
                      label="Contact ID"
                      isRequired={false}
                      name="id_contact"
                      placeholder="Contact ID"
                      value={form.id_contact.toString()}
                      onChange={handleChange}
                      maxLength={255}
                    />

                    <Input
                      label="Company ID"
                      isRequired={false}
                      name="id_company"
                      placeholder="Company ID"
                      value={form.id_company.toString()}
                      onChange={handleChange}
                      maxLength={255}
                    />
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Additional Information
                  </h3>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Description</label>
                    <textarea
                      name="description"
                      placeholder="Enter description or additional notes"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-vertical"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}