import React from 'react';
import FormField from './FormField';

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  required?: boolean;
  className?: string;
  description?: string;
}

export default function FormCheckbox({
  label,
  checked,
  onChange,
  error,
  required = false,
  className = '',
  description
}: FormCheckboxProps) {
  return (
    <FormField
      label={label}
      error={error}
      required={required}
      className={className}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
            error ? 'border-red-500' : ''
          }`}
        />
        {description && (
          <span className="ml-2 text-sm text-gray-500">{description}</span>
        )}
      </div>
    </FormField>
  );
}