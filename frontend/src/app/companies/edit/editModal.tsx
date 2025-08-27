"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Swal from 'sweetalert2'
import Input from '@/components/AddModal/Input'
import Dropdown from '@/components/AddModal/Dropdown'
import TextArea from '@/components/AddModal/TextArea'

interface Props {
    onClose: () => void;
    onUpdated?: () => void;
    data: any;
}

type CompaniesData = {
    name: string
    address: string
    phone: string
    email: string
}

export default function CompaniesModal({ onClose, onUpdated, data }: Props) {

    const [form, setForm] = useState<CompaniesData>({
        name: '',
        address: '',
        phone: '',
        email: '',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (data) {
            setForm({
                name: data.name,
                address: data.address,
                phone: data.phone,
                email: data.email,
            })
        }
    }, [data])

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        if (!form.name || !form.email || !form.phone || !form.address) {
            setError('Please complete all required fields')
            setIsSubmitting(false)
            return
        }

        try {
            const submitData = {
                name: (form.name || "").trim(),
                address: (form.address || "").trim(),
                phone: (form.phone || "").trim(),
                email: (form.email || "").trim(),
            }

            const url = `http://localhost:3000/api/companies/${data.id}`
            const method = 'PUT'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(submitData)
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.message || `Failed to update companies`)

            if (onUpdated) onUpdated()
            window.dispatchEvent(new Event('create'))

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Successfully updated companies`
            })

            onClose()
        } catch (err) {
            console.error(`Error updating companies:`, err)
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: err instanceof Error ? err.message : `Failed to update companies`
            })
            setError(err instanceof Error ? err.message : `Failed to update companies`)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative transform transition-all duration-300 max-h-[90vh] overflow-hidden pointer-events-auto">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Edit Companies
                        </h2>
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
                                        Companies Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Company"
                                            isRequired={true}
                                            name="name"
                                            placeholder="Enter companies name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            maxLength={100}
                                        />

                                        <Input
                                            label="Email"
                                            isRequired={true}
                                            name="email"
                                            placeholder="Enter email address"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />

                                        <Input
                                            label="Phone"
                                            isRequired={true}
                                            name="phone"
                                            placeholder="Enter phone number"
                                            value={form.phone}
                                            onChange={handleChange}
                                            required
                                            maxLength={20}
                                        />

                                        <TextArea
                                            label='Address'
                                            isRequired={true}
                                            name='address'
                                            placeholder='Enter your company address'
                                            value={form.address}
                                            rows={3}
                                            onChange={handleChange}
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
                                        {isSubmitting ? 'Updating...' : 'Update Companies'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}