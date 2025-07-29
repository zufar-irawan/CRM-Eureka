"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  onClose: () => void;
  onLeadCreated?: () => void;
}

export default function CreateLeadModal({ onClose, onLeadCreated }: Props) {
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
    number_of_employees: "",

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
        number_of_employees: form.number_of_employees ? parseInt(form.number_of_employees) : null,
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
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Modal Container - Positioned to center within main content area */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white w-full max-w-6xl rounded-xl shadow-2xl relative transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden mx-4 pointer-events-auto"
          style={{ marginLeft: 'max(1rem, calc((100vw - 64rem) / 2))' }}
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
                {/* Personal Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Salutation</label>
                      <select
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      >
                        <option value="">Select Salutation</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="first_name"
                        placeholder="Enter first name"
                        value={form.first_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        required
                        maxLength={50}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Last Name</label>
                      <input
                        name="last_name"
                        placeholder="Enter last name"
                        value={form.last_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={50}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Phone</label>
                      <input
                        name="phone"
                        placeholder="Enter phone number"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={20}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Mobile</label>
                      <input
                        name="mobile"
                        placeholder="Enter mobile number"
                        value={form.mobile}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={20}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Fax</label>
                      <input
                        name="fax"
                        placeholder="Enter fax number"
                        value={form.fax}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={20}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Website</label>
                      <input
                        name="website"
                        type="url"
                        placeholder="Enter website URL"
                        value={form.website}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={100}
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Job Position</label>
                      <input
                        name="job_position"
                        placeholder="Enter job position"
                        value={form.job_position}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Company</label>
                      <input
                        name="company"
                        placeholder="Enter company name"
                        value={form.company}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Industry</label>
                      <select
                        name="industry"
                        value={form.industry}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      >
                        <option value="">Select Industry</option>
                        <option value="Securities & Commodity Exchanges">Securities & Commodity Exchanges</option>
                        <option value="Service">Service</option>
                        <option value="Soap & Detergent">Soap & Detergent</option>
                        <option value="Software">Software</option>
                        <option value="Sports">Sports</option>
                        <option value="Technology">Technology</option>
                        <option value="Telecommunications">Telecommunications</option>
                        <option value="Television">Television</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Venture Capital">Venture Capital</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">No. of Employees</label>
                      <input
                        name="number_of_employees"
                        type="number"
                        placeholder="Enter number of employees"
                        value={form.number_of_employees}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Lead Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Lead Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Lead Source</label>
                      <select
                        name="lead_source"
                        value={form.lead_source}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      >
                        <option value="">Select Lead Source</option>
                        <option value="Website">Website</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Email Campaign">Email Campaign</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Trade Show">Trade Show</option>
                        <option value="Advertisement">Advertisement</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Stage</label>
                      <select
                        name="stage"
                        value={form.stage}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      >
                        <option value="">Select Stage</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualification">Qualification</option>
                        <option value="Converted">Converted</option>
                        <option value="Unqualified">Unqualified</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Rating</label>
                      <select
                        name="rating"
                        value={form.rating}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      >
                        <option value="">Select Rating</option>
                        <option value="Hot">Hot</option>
                        <option value="Warm">Warm</option>
                        <option value="Cold">Cold</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-3">
                      <label className="block text-sm font-medium text-gray-600">Street</label>
                      <input
                        name="street"
                        placeholder="Enter street address"
                        value={form.street}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={255}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">City</label>
                      <input
                        name="city"
                        placeholder="Enter city"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">State</label>
                      <input
                        name="state"
                        placeholder="Enter state"
                        value={form.state}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Postal Code</label>
                      <input
                        name="postal_code"
                        placeholder="Enter postal code"
                        value={form.postal_code}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={20}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Country</label>
                      <input
                        name="country"
                        placeholder="Enter country"
                        value={form.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        maxLength={100}
                      />
                    </div>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}