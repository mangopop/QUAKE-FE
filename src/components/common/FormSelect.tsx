import React from 'react';
import FormField from './FormField';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  className = '',
  placeholder
}: FormSelectProps) {
  return (
    <FormField
      label={label}
      error={error}
      required={required}
      className={className}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded p-2 ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}