"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Swal from 'sweetalert2'
import Input from '@/components/AddModal/Input'
import Dropdown from '@/components/AddModal/Dropdown'

interface Props {
    onClose: () => void;
    onUpdated?: () => void;
    data: any;
}

type Company = {
    id: number,
    name: string,
    address: string,
    phone: string,
    email: string
}

type ContactData = {
    name: string
    email: string
    phone: string
    company_id: number
}

export default function ContactModal({ onClose, onUpdated, data }: Props) {

    const [form, setForm] = useState<ContactData>({
        name: '',
        email: '',
        phone: '',
        company_id: 0,
    })

    const [companyOptions, setCompanyOptions] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (data) {
            setForm({
                name: data.name,
                email: data.email,
                phone: data.phone,
                company_id: data.company_id,
            })
        }
    }, [data])

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/companies', {
                  credentials: 'include',
                })
                const result = await res.json()
                const mappedOptions = result.data.map((company: any) => ({
                    value: company.id,
                    label: company.name
                }));
                setCompanyOptions(mappedOptions);

                setCompanyOptions(mappedOptions)
            } catch (error) {
                console.error('Failed to fetch companies', error)
            }
        }

        fetchCompanies()

    }, [])

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        if (!form.name || !form.email || !form.phone || !form.company_id) {
            setError('Please complete all required fields')
            setIsSubmitting(false)
            return
        }

        try {
            const res = await fetch(`http://localhost:3000/api/companies/${form.company_id}`, {
              credentials: 'include',
            })

            if (!res.ok) {
                throw new Error("Failed to fetch company detail");
            }

            const resultCompany = await res.json()

            const submitData = {
                name: (form.name || "").trim(),
                email: (form.email || "").trim(),
                phone: (form.phone || "").trim(),
                company_id: form.company_id,
                company: {
                    id: resultCompany.data.id,
                    name: (resultCompany.data.name || "").trim(),
                    address: (resultCompany.data.address || "").trim(),
                    phone: (resultCompany.data.phone || "").trim(),
                    email: (resultCompany.data.email || "").trim()
                }
            }


            const url = `http://localhost:3000/api/contacts/${data.id}`
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

            if (!response.ok) throw new Error(result.message || `Failed to update contact`)

            if (onUpdated) onUpdated()
            window.dispatchEvent(new Event('create'))

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Successfully updated contact`
            })

            onClose()
        } catch (err) {
            console.error(`Error ${data ? 'updating' : 'creating'} contact:`, err)
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: err instanceof Error ? err.message : `Failed to ${data ? 'update' : 'create'} contact`
            })
            setError(err instanceof Error ? err.message : `Failed to ${data ? 'update' : 'create'} contact`)
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
                            {data ? 'Edit Contact' : 'Add Contact'}
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
                                        Contact Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Name"
                                            isRequired={true}
                                            name="name"
                                            placeholder="Enter contact name"
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

                                        <Dropdown
                                            label="Company"
                                            name="company_id"
                                            value={form.company_id}
                                            onChange={handleChange}
                                            options={companyOptions}
                                            isRequired={true}
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
                                        {isSubmitting ? (data ? 'Updating...' : 'Creating...') : (data ? 'Update Contact' : 'Create Contact')}
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