"use client"

type dropdownprops = {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    options: [{
        value: number
        label: string
    }]
}

export default function Dropdown(
    { label, name, value, onChange, options }:
        dropdownprops
) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
                {label}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            >
                <option value="">Select here</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}