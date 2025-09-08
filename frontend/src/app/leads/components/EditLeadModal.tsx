"use client";

import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Props {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLead: any) => void;
}

interface FormState {
  title: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  fax: string;
  website: string;
  work_email: string;
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
}

export default function EditLeadModal({ lead, isOpen, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>({
    title: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    mobile: "",
    fax: "",
    website: "",
    work_email: "",
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

  const [openSections, setOpenSections] = useState({
    personal: true,
    company: false,
    address: false,
    lead: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lead) {
      setForm({
        title: lead.title || "",
        first_name: lead.first_name || "",
        last_name: lead.last_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        mobile: lead.mobile || "",
        fax: lead.fax || "",
        website: lead.website || "",
        work_email: lead.work_email || "",
        job_position: lead.job_position || "",
        company: lead.company || "",
        industry: lead.industry || "",
        number_of_employees: lead.number_of_employees || "",
        lead_source: lead.lead_source || "",
        stage: lead.stage || "",
        rating: lead.rating || "",
        street: lead.street || "",
        city: lead.city || "",
        state: lead.state || "",
        postal_code: lead.postal_code || "",
        country: lead.country || "",
        description: lead.description || "",
        owner: lead.owner || "",
      });
    }
  }, [lead]);

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

      const response = await fetch(`http://localhost:5000/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update lead');
      }

      if (onSave) {
        onSave(result);
      }

      window.dispatchEvent(new Event("lead-created"))

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: "Successfully edit lead"
      })

      onClose();
    } catch (err) {
      console.error('Error updating lead:', err);

      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err instanceof Error ? err.message : 'Failed to update lead'
      })

      setError(err instanceof Error ? err.message : 'Failed to update lead');
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
            <h2 className="text-2xl font-semibold text-gray-800">Edit Lead</h2>
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
                {/* Personal & Contact Information Section */}
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() => toggleSection("personal")}
                    className="flex w-full justify-between items-center text-lg font-medium text-gray-700 mb-2 pb-2 border-b border-gray-200"
                  >
                    Personal & Contact Information
                    {openSections.personal ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  {openSections.personal && (
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
                          First Name
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
                    </div>
                  )}

                </div>

                {/* Professional Information Section */}
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() => toggleSection("company")}
                    className="flex w-full justify-between items-center text-lg font-medium text-gray-700 mb-2 pb-2 border-b border-gray-200"
                  >
                    Company Information
                    {openSections.company ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  {openSections.company && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Company Email</label>
                        <input
                          name="work_email"
                          type="email"
                          placeholder="Enter company email address"
                          value={form.work_email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                          maxLength={100}
                        />
                      </div>

                      {/* <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Amount of Employees</label>
                        <input
                          name="number_of_employees"
                          type="number"
                          placeholder="Enter number of employees"
                          value={form.number_of_employees}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                          min="0"
                        />
                      </div> */}
                    </div>
                  )}

                </div>

                {/* Address Information Section */}
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() => toggleSection("address")}
                    className="flex w-full justify-between items-center text-lg font-medium text-gray-700 mb-2 pb-2 border-b border-gray-200"
                  >
                    Address Information
                    {openSections.address ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  {openSections.address && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  )}

                </div>

                {/* Lead Information Section */}
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() => toggleSection("lead")}
                    className="flex w-full justify-between items-center text-lg font-medium text-gray-700 mb-2 pb-2 border-b border-gray-200"
                  >
                    Lead Information
                    {openSections.lead ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  {openSections.lead && (
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
                    </div>
                  )}

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