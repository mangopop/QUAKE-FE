import { useState } from "react";
import { useCreateTemplate } from "../services/templates.service";
import { useTests } from "../services/tests.service";
import type { CreateTemplateRequest } from "../services/types";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTemplateModal({ isOpen, onClose }: CreateTemplateModalProps) {
  const createTemplate = useCreateTemplate();
  const { data: tests } = useTests();
  const [name, setName] = useState("");
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Template name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const templateData: CreateTemplateRequest = {
        name: name.trim(),
        testIds: selectedTestIds.map(id => parseInt(id, 10)),
        storyIds: [] // Empty array since we're not selecting stories in this form
      };
      await createTemplate.mutateAsync(templateData);
      onClose();
      // Reset form
      setName("");
      setSelectedTestIds([]);
      setErrors({});
    } catch (error) {
      console.error("Failed to create template:", error);
    }
  };

  const toggleTestSelection = (testId: string) => {
    setSelectedTestIds(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Template</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors({});
                }
              }}
              className={`border p-2 rounded w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter template name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Tests
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto border p-4 rounded-lg bg-gray-50">
              {tests?.map((test) => (
                <label key={test.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTestIds.includes(test.id.toString())}
                    onChange={() => toggleTestSelection(test.id.toString())}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-gray-500">
                      {test.sections.length} sections
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-4 py-2 rounded ${
                name.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Template
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}