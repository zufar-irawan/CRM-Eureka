"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface BulkEditModalProps {
  onClose: () => void;
  selectedCount: number;
  onUpdate: (field: string, value: string) => void;
  type: "leads" | "deals";
}

const leadsEnumOptions = {
  title: ["Mr", "Ms", "Mrs"],
  stage: ["New", "Contacted", "Qualification", "Converted", "Unqualified"],
  rating: ["Hot", "Warm", "Cold"]
};

const dealsEnumOptions = {
  stage: ["proposal", "negotiation", "closed_won", "closed_lost"]
};

const leadsFields = [
  "Owner", "Company", "Title", "First Name", "Last Name", "Fullname",
  "Job Position", "Email", "Phone", "Mobile", "Fax", "Website",
  "Industry", "Number Of Employees", "Lead Source", "Stage",
  "Rating", "Street", "City", "State", "Postal Code", "Country",
  "Description"
];

const dealsFields = [
  "Title", "Value", "Stage", "Owner"
];

export default function BulkEditModal({ onClose, selectedCount, onUpdate, type }: BulkEditModalProps) {
  const [selectedField, setSelectedField] = useState("");
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fields = type === "leads" ? leadsFields : dealsFields;
  const enumOptions = type === "leads" ? leadsEnumOptions : dealsEnumOptions;

  const isEnumField = Object.keys(enumOptions).includes(
    selectedField.toLowerCase().replace(/ /g, "_")
  );

  const getEnumKey = (field: string) =>
    field.toLowerCase().replace(/ /g, "_") as keyof typeof enumOptions;

  const filteredFields = fields.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdate = () => {
    if (!selectedField || !value) {
      alert("Please select a field and enter a value");
      return;
    }
    onUpdate(selectedField, value);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
      <div className="bg-white relative z-50 rounded-2xl shadow-xl w-full max-w-md p-6 overflow-visible">
        <h2 className="text-xl font-bold mb-4">Bulk Edit</h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Custom Dropdown for FIELD only */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex justify-between items-center border rounded-md px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200"
            >
              <span className={selectedField ? "text-black" : "text-gray-400"}>
                {selectedField || "Select field"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute mt-2 w-full bg-white border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="sticky top-0 bg-white p-2 border-b">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full border rounded px-3 py-1 text-sm"
                  />
                </div>
                {filteredFields.length > 0 ? (
                  filteredFields.map((field) => (
                    <button
                      key={field}
                      onClick={() => {
                        setSelectedField(field);
                        setValue("");
                        setDropdownOpen(false);
                        setSearch("");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      {field}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No match found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* VALUE section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
          {isEnumField ? (
            <div className="relative">
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm bg-white appearance-none pr-10"
              >
                <option value="">Select a value</option>
                {enumOptions[getEnumKey(selectedField)].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 text-xs">
                ▼
              </div>
            </div>
          ) : (
            <input
              type={selectedField === "Value" || selectedField === "Number Of Employees" ? "number" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Enter value"
            />
          )}
        </div>

        <button 
          onClick={handleUpdate}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
        >
          Update {selectedCount} Records
        </button>
      </div>
    </div>
  );
} 