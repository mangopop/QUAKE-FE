import React, { useState, useMemo } from 'react';
import FormField from './FormField';

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
  maxHeight = 'max-h-48'
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
      <div className="space-y-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search options..."
          className="w-full px-3 py-2 border rounded-md text-sm"
        />
        <div className={`overflow-y-auto ${maxHeight} border rounded-md bg-white`}>
          <div className="divide-y">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.id)}
                    onChange={() => handleChange(option.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options found
              </div>
            )}
          </div>
        </div>
        {selectedValues.length > 0 && (
          <div className="text-xs text-gray-500">
            {selectedValues.length} selected
          </div>
        )}
      </div>
    </FormField>
  );
}