"use client"

type InputProps = {
    label: string
    isRequired: boolean
    name: string
    placeholder?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
    maxLength?: number
}

export default function DateTime(
    { label, isRequired, name, placeholder, value, onChange, required, maxLength }:
        InputProps
) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
                {isRequired ? (
                    <>{label} <span className="text-red-500">*</span></>
                ) : label}
            </label>
            <input
                type="datetime-local"
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                required={required}
                maxLength={maxLength}
            />
        </div>
    )
}