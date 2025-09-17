"use client";

import { X, ArrowLeft, ChevronDown, ChevronRight, Asterisk } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import useUser from "../../../../hooks/useUser";

interface Props {
  onClose: () => void;
  onLeadCreated?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backButtonText?: string;
  assignedTo?: number;
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
  // stage: string; // Removed from form state
  rating: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  description: string;
  owner: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateLeadModal({
  onClose,
  onLeadCreated,
  showBackButton = false,
  onBack,
  backButtonText = "Back",
  assignedTo
}: Props) {
  const { user } = useUser()

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
    // stage: "", // Removed from initial state
    rating: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    description: "",
    owner: assignedTo ? assignedTo.toString() : (user ? user.id.toString() : ""),
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Validation functions
  // const validateEmail = (email: string): boolean => {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // };

  // const validatePhone = (phone: string): boolean => {
  //   const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,20}$/;
  //   return phoneRegex.test(phone.replace(/\s/g, ''));
  // };

  // const validateURL = (url: string): boolean => {
  //   try {
  //     new URL(url.startsWith('http') ? url : `https://${url}`);
  //     return true;
  //   } catch {
  //     return false;
  //   }
  // };

  const validateName = (name: string): boolean => {
    // Only allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(name);
  };

  // const validatePostalCode = (postalCode: string): boolean => {
  //   const postalRegex = /^\d{5}$/;
  //   return postalRegex.test(postalCode);
  // };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'first_name':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (value.trim().length > 50) return 'First name cannot exceed 50 characters';
        if (!validateName(value.trim())) return 'First name can only contain letters, spaces, hyphens, and apostrophes';
        return '';

      case 'last_name':
        if (value.trim() && value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (value.trim().length > 50) return 'Last name cannot exceed 50 characters';
        if (value.trim() && !validateName(value.trim())) return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        return '';

      default:
        return '';
    }
  };

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    // Update form state
    setForm({ ...form, [name]: value });

    // Clear previous error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Real-time validation for certain fields
    if (['email', 'work_email', 'mobile', 'phone', 'website'].includes(name)) {
      const error = validateField(name, value);
      if (error) {
        setErrors({ ...errors, [name]: error });
      }
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all required and optional fields
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key as keyof FormState]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    // Additional cross-field validations
    if (form.email && form.work_email && form.email === form.work_email) {
      newErrors.work_email = 'Company email should be different from personal email';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate form before submission
    if (!validateForm()) {
      setIsSubmitting(false);
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors in the form before submitting'
      });
      return;
    }

    try {
      const submitData = {
        ...form,
        // Trim all string values
        title: form.title.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || "",
        phone: form.phone.trim() || "",
        mobile: form.mobile.trim() || "",
        fax: form.fax.trim() || "",
        website: form.website.trim() || "",
        work_email: form.work_email.trim() || "",
        job_position: form.job_position.trim() || "",
        company: form.company.trim() || "",
        street: form.street.trim() || "",
        city: form.city.trim() || "",
        state: form.state.trim() || "",
        postal_code: form.postal_code.trim() || "",
        country: form.country.trim() || "",
        description: form.description.trim() || "",
        number_of_employees: form.number_of_employees ? parseInt(form.number_of_employees) : null,
        owner: assignedTo || user?.id,
        stage: "New" // Automatically set stage to "New" for all new leads
      };

      // Remove empty string values
      const cleaned = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(submitData).filter(([_, v]) => v !== '')
      ) as Record<string, unknown>;


      console.log('Data to submit:', cleaned);

      const response = await fetch('http://localhost:5000/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(cleaned),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create lead');
      }

      console.log('Lead created successfully:', result);

      if (onLeadCreated) {
        onLeadCreated();
      }

      window.dispatchEvent(new Event("lead-created"))

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Successfully created lead'
      })

      onClose();
    } catch (err) {
      console.error('Error creating lead:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Failed to create lead'
      })
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setIsSubmitting(false);
    }
  }

  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200";
    const errorClass = "border-red-300 focus:ring-red-500";
    const normalClass = "border-gray-300";

    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

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
            <div className="flex items-center gap-3">
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  title={backButtonText}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <h2 className="text-2xl font-semibold text-gray-800">Create Lead</h2>
            </div>
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
                        <label className="text-sm gap-1 flex font-medium text-gray-600">
                          Salutation <Asterisk size={16} color="#ff0000" />
                        </label>
                        <select
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('title')}
                        >
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Ms">Ms</option>
                        </select>
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="flex gap-1 text-sm font-medium text-gray-600">
                          First Name <Asterisk size={16} color="#ff0000" />
                        </label>
                        <input
                          name="first_name"
                          placeholder="Enter first name"
                          value={form.first_name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('first_name')}
                          maxLength={50}
                        />
                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="flex gap-1 text-sm font-medium text-gray-600">
                          Last Name
                        </label>
                        <input
                          name="last_name"
                          placeholder="Enter last name"
                          value={form.last_name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('last_name')}
                          maxLength={50}
                        />
                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="flex gap-1 text-sm font-medium text-gray-600">
                          Email <Asterisk size={16} color="#ff0000" />
                        </label>
                        <input
                          name="email"
                          type="email"
                          placeholder="Enter email address"
                          value={form.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('email')}
                          maxLength={100}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="flex gap-1 text-sm font-medium text-gray-600">
                          Mobile <Asterisk size={16} color="#ff0000" />
                        </label>
                        <input
                          name="mobile"
                          placeholder="Enter mobile number"
                          value={form.mobile}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('mobile')}
                          maxLength={20}
                        />
                        {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Fax</label>
                        <input
                          name="fax"
                          placeholder="Enter fax number"
                          value={form.fax}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('fax')}
                          maxLength={20}
                        />
                        {errors.fax && <p className="text-red-500 text-xs mt-1">{errors.fax}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Job Position</label>
                        <input
                          name="job_position"
                          placeholder="Enter job position"
                          value={form.job_position}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('job_position')}
                          maxLength={100}
                        />
                        {errors.job_position && <p className="text-red-500 text-xs mt-1">{errors.job_position}</p>}
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
                        <label className="flex gap-1 text-sm font-medium text-gray-600">
                          Company <Asterisk size={16} color="#ff0000" />
                        </label>
                        <input
                          name="company"
                          placeholder="Enter company name"
                          value={form.company}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('company')}
                          maxLength={100}
                        />
                        {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Industry</label>
                        <select
                          name="industry"
                          value={form.industry}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('industry')}
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
                        {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Phone</label>
                        <input
                          name="phone"
                          placeholder="Enter phone number"
                          value={form.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('phone')}
                          maxLength={20}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Website</label>
                        <input
                          name="website"
                          type="url"
                          placeholder="Enter website URL"
                          value={form.website}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('website')}
                          maxLength={100}
                        />
                        {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Company Email</label>
                        <input
                          name="work_email"
                          type="email"
                          placeholder="Enter work email address"
                          value={form.work_email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('work_email')}
                          maxLength={100}
                        />
                        {errors.work_email && <p className="text-red-500 text-xs mt-1">{errors.work_email}</p>}
                      </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1 md:col-span-3">
                        <label className="flex gap-1 text-sm font-medium text-gray-600">
                          Street <Asterisk size={16} color="#ff0000" />
                        </label>
                        <input
                          name="street"
                          placeholder="Enter street address"
                          value={form.street}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('street')}
                          maxLength={255}
                        />
                        {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="flex gap-1 text-sm font-medium text-gray-600">
                          City <Asterisk size={16} color="#ff0000" />
                        </label>
                        <input
                          name="city"
                          placeholder="Enter city"
                          value={form.city}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('city')}
                          maxLength={100}
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="flex gap-1 text-sm font-medium text-gray-600">
                          State <Asterisk size={16} color="#ff0000" />
                        </label>
                        <input
                          name="state"
                          placeholder="Enter state"
                          value={form.state}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('state')}
                          maxLength={100}
                        />
                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Postal Code</label>
                        <input
                          name="postal_code"
                          placeholder="Enter postal code (5 digits)"
                          value={form.postal_code}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('postal_code')}
                          maxLength={5}
                          pattern="\d{5}"
                        />
                        {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="flex gap-1 text-sm font-medium text-gray-600">
                          Country <Asterisk size={16} color="#ff0000" />
                        </label>
                        <input
                          name="country"
                          placeholder="Enter country"
                          value={form.country}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('country')}
                          maxLength={100}
                        />
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                      </div>
                    </div>
                  )}

                </div>

                {/* Lead Information Section - Stage field removed */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Lead Source</label>
                        <select
                          name="lead_source"
                          value={form.lead_source}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('lead_source')}
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
                        {errors.lead_source && <p className="text-red-500 text-xs mt-1">{errors.lead_source}</p>}
                      </div>

                      {/* Stage field removed - it will be automatically set to "New" */}

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-600">Rating</label>
                        <select
                          name="rating"
                          value={form.rating}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={getInputClassName('rating')}
                        >
                          <option value="">Select Rating</option>
                          <option value="Hot">Hot</option>
                          <option value="Warm">Warm</option>
                          <option value="Cold">Cold</option>
                        </select>
                        {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4">
                  <button
                    type="button"
                    onClick={showBackButton && onBack ? onBack : onClose}
                    disabled={isSubmitting}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium disabled:opacity-50"
                  >
                    {showBackButton && onBack ? backButtonText : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
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