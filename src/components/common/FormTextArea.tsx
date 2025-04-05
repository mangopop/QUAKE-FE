import React from 'react';
import FormField from './FormField';

interface FormTextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export default function FormTextArea({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  rows = 3,
  className = '',
}: FormTextAreaProps) {
  return (
    <FormField
      label={label}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full border rounded p-2 ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
      />
    </FormField>
  );
}