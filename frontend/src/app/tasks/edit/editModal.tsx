"use client";

import DateTime from "@/components/AddModal/DateTime";
import Dropdown from "@/components/AddModal/Dropdown";
import Input from "@/components/AddModal/Input";
import TextArea from "@/components/AddModal/TextArea";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Props {
    onClose: () => void;
    onUpdated?: () => void;
    data: any;
}

export default function EditTasksModal({ onClose, onUpdated, data }: Props) {
    const [form, setForm] = useState(data);

    const [leadOptions, setLeadOptions] = useState<any[]>([]);
    const [userOptions, setUserOptions] = useState<any[]>([]);

    const [companyOptions, setCompanyOptions] = useState<any[]>([])
    const [contactOptions, setContactOptions] = useState<any[]>([])

    useEffect(() => {
        setForm(data); // sync data
    }, [data]);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/leads");
                const result = await res.json();
                const mappedOptions = result.leads.map((lead: any) => ({
                    value: lead.id,
                    label: lead.fullname,
                }));
                setLeadOptions(mappedOptions);
            } catch (error) {
                console.error("Failed to fetch leads", error);
            }
        };

        const fetchUsers = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/users");
                const result = await res.json();
                const data = result.data;
                if (!Array.isArray(data)) throw new Error("Data users is not an array");
                const mappedOptions = data.map((user: any) => ({
                    value: user.id,
                    label: user.name,
                }));
                setUserOptions(mappedOptions);
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };

        fetchLeads();
        fetchUsers();
    }, []);

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

        if (!form.title || !form.lead_id || !form.assigned_to || !form.due_date) {
            setError("Please complete all required fields");
            setIsSubmitting(false);
            return;
        }

        try {
            const submitData = {
                lead_id: Number(form.lead_id),
                assigned_to: Number(form.assigned_to),
                title: form.title.trim(),
                description: form.description.trim(),
                category: form.category,
                due_date: form.due_date.trim(),
                priority: form.priority,
            };

            const response = await fetch(`http://localhost:3000/api/tasks/${data.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(submitData),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || "Failed to update task");

            if (onUpdated) onUpdated();
            window.dispatchEvent(new Event("create"));

            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Successfully updated task",
            });

            onClose();
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

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl relative transform transition-all duration-300 max-h-[90vh] overflow-hidden pointer-events-auto">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-2xl font-semibold text-gray-800">Edit Task</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                                        Task Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Task Title"
                                            isRequired={true}
                                            name="title"
                                            placeholder="Enter task title"
                                            value={form.title}
                                            onChange={handleChange}
                                            required
                                            maxLength={100}
                                        />

                                        <Dropdown
                                            label="Lead"
                                            name="lead_id"
                                            value={form.lead_id}
                                            onChange={handleChange}
                                            options={leadOptions}
                                        />

                                        <Dropdown
                                            label="Assigned To"
                                            name="assigned_to"
                                            value={form.assigned_to}
                                            onChange={handleChange}
                                            options={userOptions}
                                        />

                                        <Dropdown
                                            label="Category"
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                            options={[
                                                { value: "Kanvasing", label: "Kanvasing" },
                                                { value: "Followup", label: "Followup" },
                                                { value: "Penawaran", label: "Penawaran" },
                                                { value: "Lainnya", label: "Lainnya" },
                                            ]}
                                        />

                                        <Dropdown
                                            label="Priority"
                                            name="priority"
                                            value={form.priority}
                                            onChange={handleChange}
                                            options={[
                                                { value: "low", label: "Low" },
                                                { value: "medium", label: "Medium" },
                                                { value: "high", label: "High" },
                                            ]}
                                        />

                                        <DateTime
                                            label="Due Date"
                                            isRequired={true}
                                            name="due_date"
                                            value={form.due_date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <TextArea
                                            label="Description"
                                            name="description"
                                            placeholder="Enter task description or additional notes"
                                            value={form.description}
                                            onChange={handleChange}
                                            rows={4}
                                        />
                                    </div>
                                </div>

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
                                        {isSubmitting ? "Updating..." : "Update Task"}
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
