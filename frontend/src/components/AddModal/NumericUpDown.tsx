"use client"

type InputProps = {
    label: string
    isRequired: boolean
    name: string
    placeholder?: string
    value: number
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
    maxLength?: number
    min?: number
    max?: number
    step?: number
}

export default function NumericUpDown({
    label,
    isRequired,
    name,
    placeholder,
    value,
    onChange,
    required,
    maxLength,
    min,
    max,
    step
}: InputProps) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
                {isRequired ? (
                    <>
                        {label} <span className="text-red-500">*</span>
                    </>
                ) : (
                    label
                )}
            </label>
            <input
                type="number"
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                maxLength={maxLength}
                min={min}
                max={max}
                step={step}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
        </div>
    )
}
