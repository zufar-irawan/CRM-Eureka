"use client";

import Dropdown from "@/components/AddModal/Dropdown";
import Input from "@/components/AddModal/Input";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
    onClose: () => void;
    onLeadCreated?: () => void;
}

export type DealsForm = {
    title: string;
    first_name: string;
    last_name: string;

    email: string;
    phone: string;
    mobile: string;
    fax: string;
    website: string;

    job_position: string;
    company: string;
    industry: string;
    number_of_employees: string;

    lead_source: string;
    stage: string;
    rating: string;

    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;

    description: string;
    owner: string;
};


export default function CreateDealsModal({ onClose, onLeadCreated }: Props) {
    const [form, setForm] = useState({
        title: "",
        first_name: "",
        last_name: "",

        email: "",
        phone: "",
        mobile: "",
        fax: "",
        website: "",

        job_position: "",
        company: "",
        industry: "",
        company_address: "",
        company_phone: "",
        company_email: "",

        lead_source: "",
        stage: "",
        rating: "",

        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",

        description: "",

        owner: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

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
                // number_of_employees: form.number_of_employees ? parseInt(form.number_of_employees) : null,
                owner: form.owner ? parseInt(form.owner) : null,
            };

            // Remove empty string values
            Object.keys(submitData).forEach(key => {
                if ((submitData as any)[key] === '') {
                    delete (submitData as any)[key];
                }
            });

            console.log('Data to submit:', submitData);

            const response = await fetch('http://localhost:5000/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(submitData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create lead');
            }

            console.log('Lead created successfully:', result);

            if (onLeadCreated) {
                onLeadCreated();
            }

            onClose();
        } catch (err) {
            console.error('Error creating lead:', err);
            setError(err instanceof Error ? err.message : 'Failed to create lead');
        } finally {
            setIsSubmitting(false);
        }
    }

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
                // style={{ marginLeft: 'max(1rem, calc((100vw - 64rem) / 2))' }}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-2xl font-semibold text-gray-800">Create Lead</h2>
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

                                    <div className="grid grid-cols-1 md:grid-cols-3  gap-4">
                                        <Input
                                            label={"Organization Name"}
                                            isRequired={true}
                                            name="organization"
                                            placeholder="Organization Name"
                                            value={form.company}
                                            onChange={handleChange}
                                            required
                                            maxLength={50}
                                        />

                                        <Input
                                            label="Address"
                                            isRequired={true}
                                            name="companyAddress"
                                            placeholder="Company address"
                                            value={form.company_address}
                                            onChange={handleChange}
                                            required
                                            maxLength={255}
                                        />

                                        <Input
                                            label="Phone"
                                            isRequired={true}
                                            name="companyPhone"
                                            placeholder="Company Phone"
                                            value={form.company_phone}
                                            onChange={handleChange}
                                            required
                                            maxLength={12}
                                        />

                                        <Input
                                            label="Email"
                                            isRequired={true}
                                            name="companyEmail"
                                            placeholder="Company Email"
                                            value={form.company_email}
                                            onChange={handleChange}
                                            required
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
                                        {isSubmitting ? 'Creating...' : 'Create Lead'}
                                    </button>
                                </div>

                            </form>
                            <div />
                        </div>
                    </div>
                </div >
            </div >
        </>
    );
}