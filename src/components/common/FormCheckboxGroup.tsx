import React, { useState, useMemo } from 'react';
import FormField from './FormField';
import FormInput from './FormInput';

interface Option {
  id: string;
  label: string;
}

interface FormCheckboxGroupProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  error?: string;
  required?: boolean;
  className?: string;
  maxHeight?: string;
}

export default function FormCheckboxGroup({
  label,
  options,
  selectedValues,
  onChange,
  error,
  required,
  className = '',
  maxHeight = 'h-48'
}: FormCheckboxGroupProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  const handleChange = (optionId: string) => {
    const newSelectedValues = selectedValues.includes(optionId)
      ? selectedValues.filter(id => id !== optionId)
      : [...selectedValues, optionId];
    onChange(newSelectedValues);
  };

  return (
    <FormField
      label={label}
      error={error}
      required={required}
      className={className}
    >
      <div className="space-y-1">
        <FormInput
          label=""
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search options..."
          className="mb-1"
        />
        <div className={`overflow-y-auto max-h-48 border rounded-md bg-white`}>
          <div className="divide-y divide-gray-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.id)}
                    onChange={() => handleChange(option.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{option.label}</span>
                </label>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-gray-500">
                No options found
              </div>
            )}
          </div>
        </div>
        {selectedValues.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {selectedValues.length} selected
          </div>
        )}
      </div>
    </FormField>
  );
}