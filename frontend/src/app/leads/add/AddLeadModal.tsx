"use client";

import { X } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

interface Props {
  onClose: () => void;
  onLeadCreated?: () => void;
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

interface FormErrors {
  [key: string]: string;
}

export default function CreateLeadModal({ onClose, onLeadCreated }: Props) {
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Allow various phone formats: +62, 08, 021, etc.
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,20}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateURL = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const validateName = (name: string): boolean => {
    // Only allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-\']+$/;
    return nameRegex.test(name);
  };

  const validatePostalCode = (postalCode: string): boolean => {
    // Indonesian postal code format (5 digits)
    const postalRegex = /^\d{5}$/;
    return postalRegex.test(postalCode);
  };

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

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!validateEmail(value.trim())) return 'Please enter a valid email address';
        if (value.length > 100) return 'Email cannot exceed 100 characters';
        return '';

      case 'work_email':
        if (!value.trim()) return 'Company email is required';
        if (!validateEmail(value.trim())) return 'Please enter a valid email address';
        if (value.length > 100) return 'Email cannot exceed 100 characters';
        return '';

      case 'mobile':
        if (!value.trim()) return 'Mobile number is required';
        if (!validatePhone(value.trim())) return 'Please enter a valid mobile number';
        if (value.length > 20) return 'Mobile number cannot exceed 20 characters';
        return '';

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!validatePhone(value.trim())) return 'Please enter a valid phone number';
        if (value.length > 20) return 'Phone number cannot exceed 20 characters';
        return '';

      case 'fax':
        if (value.trim() && !validatePhone(value.trim())) return 'Please enter a valid fax number';
        if (value.length > 20) return 'Fax number cannot exceed 20 characters';
        return '';

      case 'website':
        if (value.trim() && !validateURL(value.trim())) return 'Please enter a valid website URL';
        if (value.length > 100) return 'Website URL cannot exceed 100 characters';
        return '';

      case 'job_position':
        if (value.trim() && value.trim().length < 2) return 'Job position must be at least 2 characters';
        if (value.length > 100) return 'Job position cannot exceed 100 characters';
        return '';

      case 'company':
        if (!value.trim()) return 'Company name is required';
        if (value.trim().length < 2) return 'Company name must be at least 2 characters';
        if (value.length > 100) return 'Company name cannot exceed 100 characters';
        return '';

      case 'number_of_employees':
        if (value.trim()) {
          const num = parseInt(value);
          if (isNaN(num) || num < 0) return 'Number of employees must be a positive number';
          if (num > 999999) return 'Number of employees seems too large';
        }
        return '';

      case 'street':
        if (!value.trim()) return 'Street address is required';
        if (value.trim().length < 5) return 'Street address must be at least 5 characters';
        if (value.length > 255) return 'Street address cannot exceed 255 characters';
        return '';

      case 'city':
        if (!value.trim()) return 'City is required';
        if (value.trim().length < 2) return 'City must be at least 2 characters';
        if (value.length > 100) return 'City cannot exceed 100 characters';
        if (value.trim() && !validateName(value.trim())) return 'City can only contain letters, spaces, hyphens, and apostrophes';
        return '';

      case 'state':
        if (!value.trim()) return 'State is required';
        if (value.trim().length < 2) return 'State must be at least 2 characters';
        if (value.length > 100) return 'State cannot exceed 100 characters';
        if (value.trim() && !validateName(value.trim())) return 'State can only contain letters, spaces, hyphens, and apostrophes';
        return '';

      case 'country':
        if (!value.trim()) return 'Country is required';
        if (value.trim().length < 2) return 'Country must be at least 2 characters';
        if (value.length > 100) return 'Country cannot exceed 100 characters';
        if (value.trim() && !validateName(value.trim())) return 'Country can only contain letters, spaces, hyphens, and apostrophes';
        return '';

      case 'postal_code':
        if (value.trim() && !validatePostalCode(value.trim())) return 'Please enter a valid 5-digit postal code';
        return '';

      case 'description':
        if (value.length > 500) return 'Description cannot exceed 500 characters';
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
        email: form.email.trim(),
        phone: form.phone.trim(),
        mobile: form.mobile.trim(),
        fax: form.fax.trim(),
        website: form.website.trim(),
        work_email: form.work_email.trim(),
        job_position: form.job_position.trim(),
        company: form.company.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code: form.postal_code.trim(),
        country: form.country.trim(),
        description: form.description.trim(),
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
                {/* Personal & Contact Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Personal & Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">
                        Salutation <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('title')}
                      >
                        <option value="">Select Salutation</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                      </select>
                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
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
                        onBlur={handleBlur}
                        className={getInputClassName('first_name')}
                        required
                        maxLength={50}
                      />
                      {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Last Name</label>
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
                      <label className="block text-sm font-medium text-gray-600">Email <span className="text-red-500">*</span></label>
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('email')}
                        maxLength={100}
                        required
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Mobile <span className="text-red-500">*</span></label>
                      <input
                        name="mobile"
                        placeholder="Enter mobile number"
                        value={form.mobile}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('mobile')}
                        maxLength={20}
                        required
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
                </div>

                {/* Professional Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Company <span className="text-red-500">*</span></label>
                      <input
                        name="company"
                        placeholder="Enter company name"
                        value={form.company}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('company')}
                        maxLength={100}
                        required
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
                      <label className="block text-sm font-medium text-gray-600">No. of Employees</label>
                      <input
                        name="number_of_employees"
                        type="number"
                        placeholder="Enter number of employees"
                        value={form.number_of_employees}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('number_of_employees')}
                        min="0"
                        max="999999"
                      />
                      {errors.number_of_employees && <p className="text-red-500 text-xs mt-1">{errors.number_of_employees}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Phone <span className="text-red-500">*</span></label>
                      <input
                        name="phone"
                        placeholder="Enter phone number"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('phone')}
                        maxLength={20}
                        required
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
                      <label className="block text-sm font-medium text-gray-600">Company Email <span className="text-red-500">*</span></label>
                      <input
                        name="work_email"
                        type="email"
                        placeholder="Enter work email address"
                        value={form.work_email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('work_email')}
                        maxLength={100}
                        required
                      />
                      {errors.work_email && <p className="text-red-500 text-xs mt-1">{errors.work_email}</p>}
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

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Stage</label>
                      <select
                        name="stage"
                        value={form.stage}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('stage')}
                      >
                        <option value="">Select Stage</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualification">Qualification</option>
                        <option value="Converted">Converted</option>
                        <option value="Unqualified">Unqualified</option>
                      </select>
                      {errors.stage && <p className="text-red-500 text-xs mt-1">{errors.stage}</p>}
                    </div>

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
                </div>

                {/* Address Information Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-3">
                      <label className="block text-sm font-medium text-gray-600">Street <span className="text-red-500">*</span></label>
                      <input
                        name="street"
                        placeholder="Enter street address"
                        value={form.street}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('street')}
                        maxLength={255}
                        required
                      />
                      {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">City <span className="text-red-500">*</span></label>
                      <input
                        name="city"
                        placeholder="Enter city"
                        value={form.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('city')}
                        maxLength={100}
                        required
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">State <span className="text-red-500">*</span></label>
                      <input
                        name="state"
                        placeholder="Enter state"
                        value={form.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('state')}
                        maxLength={100}
                        required
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
                      <label className="block text-sm font-medium text-gray-600">Country <span className="text-red-500">*</span></label>
                      <input
                        name="country"
                        placeholder="Enter country"
                        value={form.country}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClassName('country')}
                        maxLength={100}
                        required
                      />
                      {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-100">
                    Additional Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Description</label>
                      <textarea
                        name="description"
                        placeholder="Enter description (optional)"
                        value={form.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`${getInputClassName('description')} resize-none h-24`}
                        maxLength={500}
                        rows={4}
                      />
                      <div className="flex justify-between items-center">
                        {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                        <p className="text-gray-400 text-xs ml-auto">
                          {form.description.length}/500 characters
                        </p>
                      </div>
                    </div>
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