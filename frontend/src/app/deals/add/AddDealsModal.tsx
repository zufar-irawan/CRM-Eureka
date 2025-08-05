"use client";

import Dropdown from "@/components/AddModal/Dropdown";
import Input from "@/components/AddModal/Input";
import NumericUpDown from "@/components/AddModal/NumericUpDown";
import TextArea from "@/components/AddModal/TextArea";
import { X } from "lucide-react";
import { useEffect, useState } from "react"
import Swal from "sweetalert2";

interface Props {
    onClose: () => void;
    onLeadCreated?: () => void;
}

export type DealsForm = {
    title: string
    value: number
    stage: string
    lead_id: number | null
    id_contact: number | null
    id_company: number | null
    company_name: string
    company_email: string
    company_phone: string
    company_address: string
    contact_name: string
    contact_email: string
    contact_phone: string
    contact_position: string
    owner: number
    created_by: number | null
}

export default function CreateDealsModal({ onClose, onLeadCreated }: Props) {
    const [form, setForm] = useState<DealsForm>({
        title: '',
        value: 0,
        stage: 'proposal',
        lead_id: null,
        id_contact: null,
        id_company: null,
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        contact_position: '',
        owner: 0,
        created_by: null,
    })

    // Toggle states for existing company/contact
    const [useExistingCompany, setUseExistingCompany] = useState(false);
    const [useExistingContact, setUseExistingContact] = useState(false);

    const [companyOptions, setCompanyOptions] = useState<any[]>([])
    const [contactOptions, setContactOptions] = useState<any[]>([])

    useEffect(() => {

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
    }, [])

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        console.log("Field changed:", e.target.name, "Value:", e.target.value);
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    // Handle toggle changes
    function handleCompanyToggle(checked: boolean) {
        setUseExistingCompany(checked);
        if (checked) {
            // Clear manual company fields when switching to existing
            setForm(prev => ({
                ...prev,
                company_name: '',
                company_email: '',
                company_phone: '',
                company_address: ''
            }));
        } else {
            // Clear existing company selection when switching to manual
            setForm(prev => ({
                ...prev,
                id_company: null
            }));
        }
    }

    function handleContactToggle(checked: boolean) {
        setUseExistingContact(checked);
        if (checked) {
            // Clear manual contact fields when switching to existing
            setForm(prev => ({
                ...prev,
                contact_name: '',
                contact_email: '',
                contact_phone: '',
                contact_position: ''
            }));
        } else {
            // Clear existing contact selection when switching to manual
            setForm(prev => ({
                ...prev,
                id_contact: null
            }));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        // Validation
        if (!form.title || form.value <= 0) {
            setError("Please fill in title and value correctly");
            setIsSubmitting(false);
            return;
        }

        // Validate company data
        if (useExistingCompany && !form.id_company) {
            setError("Please select a company");
            setIsSubmitting(false);
            return;
        }

        if (!useExistingCompany && (!form.company_name || !form.company_email)) {
            setError("Please fill in company name and email");
            setIsSubmitting(false);
            return;
        }

        // Validate contact data
        if (useExistingContact && !form.id_contact) {
            setError("Please select a contact");
            setIsSubmitting(false);
            return;
        }

        if (!useExistingContact && (!form.contact_name || !form.contact_email)) {
            setError("Please fill in contact name and email");
            setIsSubmitting(false);
            return;
        }

        try {
            const submitData = {
                title: form.title.trim(),
                value: Number(form.value),
                stage: form.stage || 'proposal',
                lead_id: form.lead_id,
                id_contact: useExistingContact ? Number(form.id_contact) : null,
                id_company: useExistingCompany ? Number(form.id_company) : null,
                company_name: !useExistingCompany ? form.company_name.trim() : '',
                company_email: !useExistingCompany ? form.company_email.trim() : '',
                company_phone: !useExistingCompany ? form.company_phone.trim() : '',
                company_address: !useExistingCompany ? form.company_address.trim() : '',
                contact_name: !useExistingContact ? form.contact_name.trim() : '',
                contact_email: !useExistingContact ? form.contact_email.trim() : '',
                contact_phone: !useExistingContact ? form.contact_phone.trim() : '',
                contact_position: !useExistingContact ? form.contact_position.trim() : '',
                owner: Number(form.owner),
                created_by: form.created_by,
            };

            console.log("Data to submit:", submitData);

            const response = await fetch("http://localhost:3000/api/deals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(submitData),
            })

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to create deal")
            }

            console.log("Deal created successfully:", result)

            if (onLeadCreated) {
                onLeadCreated();
            }

            window.dispatchEvent(new Event("deals-add"))

            Swal.fire({
                icon: 'success',
                title: "Success",
                text: "Successfully create deal"
            })
            onClose();
        } catch (err) {
            console.error("Error creating deal:", err);
            Swal.fire({
                icon: 'error',
                title: "Failed",
                text: err instanceof Error ? err.message : "Failed to create deal"
            })
            setError(err instanceof Error ? err.message : "Failed to create deal");
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

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl relative transform transition-all duration-300 max-h-[90vh] overflow-hidden pointer-events-auto">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-2xl font-semibold text-gray-800">Create Deals</h2>
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
                                {/* Deals Information Section */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                                        Deals Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input
                                            label="Deals Title"
                                            isRequired={true}
                                            name="title"
                                            placeholder="Enter Deals Title"
                                            value={form.title}
                                            onChange={handleChange}
                                            required
                                            maxLength={50}
                                        />

                                        <NumericUpDown
                                            label="Deals Value"
                                            isRequired={true}
                                            name="value"
                                            placeholder="0"
                                            value={form.value}
                                            onChange={handleChange}
                                            min={1000}
                                            max={1000000000}
                                            step={500}
                                            required
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
                                    </div>
                                </div>

                                {/* Company Section */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                                        <h3 className="text-lg font-medium text-gray-700">
                                            Company Information
                                        </h3>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm text-gray-600">Use Existing Company</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={useExistingCompany}
                                                    onChange={(e) => handleCompanyToggle(e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {useExistingCompany ? (
                                        <div className="grid grid-cols-1">
                                            <Dropdown
                                                label="Select Company"
                                                name="id_company"
                                                value={form.id_company || ''}
                                                onChange={handleChange}
                                                options={companyOptions}
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Company Name"
                                                isRequired={true}
                                                name="company_name"
                                                placeholder="Enter company name"
                                                value={form.company_name}
                                                onChange={handleChange}
                                                maxLength={100}
                                            />
                                            <Input
                                                label="Company Email"
                                                isRequired={true}
                                                name="company_email"
                                                placeholder="Enter company email"
                                                value={form.company_email}
                                                onChange={handleChange}
                                                maxLength={100}
                                            />
                                            <Input
                                                label="Company Phone"
                                                isRequired={false}
                                                name="company_phone"
                                                placeholder="Enter company phone"
                                                value={form.company_phone}
                                                onChange={handleChange}
                                                maxLength={20}
                                            />
                                            <div className="md:col-span-2">
                                                <TextArea
                                                    label="Company Address"
                                                    name="company_address"
                                                    placeholder="Enter company address"
                                                    value={form.company_address}
                                                    onChange={handleChange}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Contact Section */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                                        <h3 className="text-lg font-medium text-gray-700">
                                            Contact Information
                                        </h3>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm text-gray-600">Use Existing Contact</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={useExistingContact}
                                                    onChange={(e) => handleContactToggle(e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {useExistingContact ? (
                                        <div className="grid grid-cols-1">
                                            <Dropdown
                                                label="Select Contact"
                                                name="id_contact"
                                                value={form.id_contact || ''}
                                                onChange={handleChange}
                                                options={contactOptions}
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Contact Name"
                                                isRequired={true}
                                                name="contact_name"
                                                placeholder="Enter contact name"
                                                value={form.contact_name}
                                                onChange={handleChange}
                                                maxLength={100}
                                            />
                                            <Input
                                                label="Contact Email"
                                                isRequired={true}
                                                name="contact_email"
                                                placeholder="Enter contact email"
                                                value={form.contact_email}
                                                onChange={handleChange}
                                                maxLength={100}
                                            />
                                            <Input
                                                label="Contact Phone"
                                                isRequired={false}
                                                name="contact_phone"
                                                placeholder="Enter contact phone"
                                                value={form.contact_phone}
                                                onChange={handleChange}
                                                maxLength={20}
                                            />
                                            <Input
                                                label="Contact Position"
                                                isRequired={false}
                                                name="contact_position"
                                                placeholder="Enter contact position"
                                                value={form.contact_position}
                                                onChange={handleChange}
                                                maxLength={50}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium disabled:opacity-50">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSubmitting ? 'Creating...' : 'Create Deal'}
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