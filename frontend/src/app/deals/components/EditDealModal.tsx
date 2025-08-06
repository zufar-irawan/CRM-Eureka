"use client";

import Dropdown from "@/components/AddModal/Dropdown";
import Input from "@/components/AddModal/Input";
import NumericUpDown from "@/components/AddModal/NumericUpDown";
import { useDealEditStore } from "@/Store/dealModalStore";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Props {
  deal: any;
  isOpen: boolean;
  closeModal: () => void;
  onSave: (updatedDeal: any) => void;
}

export type DealsForm = {
  title: string;
  value: number;
  stage: string;
  id_contact: number;
  id_company: number;
}

export default function EditDealModal() {
  const [form, setForm] = useState<DealsForm>({
    title: "",
    value: 0,
    stage: "",
    id_contact: 0,
    id_company: 0,
  })

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("")

  const { id, isOpen, closeModal } = useDealEditStore();

  const [companyOptions, setCompanyOptions] = useState<any[]>([])
  const [contactOptions, setContactOptions] = useState<any[]>([])

  useEffect(() => {
    if (id && isOpen) {
      const fetchDeal = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/deals/${id}`);
          const result = await res.json();
          const data = result.data;

          setForm({
            title: data.title || "",
            value: data.value || 0,
            stage: data.stage || "",
            id_contact: data.id_contact || 0,
            id_company: data.id_company || 0,
          });
        } catch (error) {
          console.error("Failed to fetch deal by ID", error);
          Swal.fire("Failed", "Cannot load deal data", "error");
          closeModal();
        }
      }

      fetchDeal()
    }

    const fetchCompanies = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/companies")
        const result = await res.json()
        const data = result.data

        const mappedOptions = data.map((company: any) => ({
          value: company.id,
          label: company.name,
        }))

        setCompanyOptions(mappedOptions)
      } catch (error) {
        console.error("Failed to fetch companies", error)
      }
    }

    const fetchContact = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/contacts")
        const result = await res.json()
        const data = result.data

        const mappedOptions = data.map((contacts: any) => ({
          value: contacts.id,
          label: contacts.name,
        }))

        setContactOptions(mappedOptions)
      } catch (error) {
        console.error("Failed to fetch contacts", error)
      }
    }

    fetchContact()
    fetchCompanies()
  }, [id, isOpen]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!form.title || !form.value || !form.stage || !form.id_contact || !form.id_company) {
      setError("Please complete all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = {
        title: form.title.trim(),
        value: form.value,
        stage: form.stage,
        id_contact: form.id_contact,
        id_company: form.id_company,
      };

      const response = await fetch(`http://localhost:3000/api/deals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Failed to update task");

      window.dispatchEvent(new Event("deals-add"));

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Successfully updated task",
      });

      closeModal();
    } catch (err) {
      console.error("Error updating task:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err instanceof Error ? err.message : "Failed to update task",
      });
      setError(err instanceof Error ? err.message : "Failed to update task");
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
        onClick={closeModal}
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
              onClick={closeModal}
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

                    <Dropdown
                      label="Select Contact"
                      name="id_contact"
                      value={form.id_contact || ''}
                      onChange={handleChange}
                      options={contactOptions}
                    />

                    <Dropdown
                      label="Select Company"
                      name="id_company"
                      value={form.id_company || ''}
                      onChange={handleChange}
                      options={companyOptions}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4">
                  <button
                    type="button"
                    onClick={closeModal}
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