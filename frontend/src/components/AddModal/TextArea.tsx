type textAreaProps = {
    label: string
    name: string
    placeholder: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    rows: number
    isRequired?: boolean
}

export default function TextArea(
    { label, name, placeholder, value, onChange, rows, isRequired }:
        textAreaProps
) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600">
                {label}
                {isRequired && (<span className="text-red-500">*</span>)}
            </label>
            <textarea
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-vertical"
            />
        </div>
    )
}