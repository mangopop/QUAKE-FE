import React from 'react';
import FormInput from './FormInput';
import Button from './Button';

export interface Section {
  name: string;
  description: string;
  orderIndex?: number;
}

interface SectionFormProps {
  sections: Section[];
  onAddSection: () => void;
  onRemoveSection: (index: number) => void;
  onUpdateSection: (index: number, field: keyof Section, value: string) => void;
  errors?: { [key: number]: string };
}

export default function SectionForm({
  sections,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
  errors = {}
}: SectionFormProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Sections
        </label>
        <Button
          onClick={onAddSection}
          variant="secondary"
          className="text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Section
        </Button>
      </div>
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-700">Section {index + 1}</h3>
              {sections.length > 1 && (
                <Button
                  onClick={() => onRemoveSection(index)}
                  variant="danger"
                  className="p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <FormInput
                label="Name"
                value={section.name}
                onChange={(value) => onUpdateSection(index, "name", value)}
                error={errors[index]}
                placeholder="Section name"
              />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea
                  value={section.description}
                  onChange={(e) => onUpdateSection(index, "description", e.target.value)}
                  className="border p-2 rounded w-full"
                  rows={2}
                  placeholder="Section description"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}