import { useState } from "react";
import { useTemplates } from "../services/templates.service";
import type { CreateTestRequest } from "../services/types";

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (test: CreateTestRequest) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreateTestModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}: CreateTestModalProps) {
  const [newTest, setNewTest] = useState<CreateTestRequest>({
    name: "",
    templateId: undefined,
    sections: []
  });
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newTest);
    setNewTest({ name: "", templateId: undefined, sections: [] });
  };

  const addSection = () => {
    setNewTest(prev => ({
      ...prev,
      sections: [...prev.sections, { name: "", description: "" }]
    }));
  };

  const updateSection = (index: number, key: 'name' | 'description', value: string) => {
    setNewTest(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [key]: value } : section
      )
    }));
  };

  const removeSection = (index: number) => {
    setNewTest(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Test</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Name
            </label>
            <input
              type="text"
              value={newTest.name}
              onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template (Optional)
            </label>
            <select
              value={newTest.templateId || ""}
              onChange={(e) => setNewTest(prev => ({ ...prev, templateId: e.target.value ? e.target.value : undefined }))}
              className="border p-2 rounded w-full"
            >
              <option value="">Select a template...</option>
              {templates?.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Sections
              </label>
              <button
                type="button"
                onClick={addSection}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                + Add Section
              </button>
            </div>
            <div className="space-y-4">
              {newTest.sections.map((section, index) => (
                <div key={index} className="border p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Section {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Section Name"
                      value={section.name}
                      onChange={(e) => updateSection(index, 'name', e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                    <textarea
                      placeholder="Section Description"
                      value={section.description}
                      onChange={(e) => updateSection(index, 'description', e.target.value)}
                      className="border p-2 rounded w-full"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}