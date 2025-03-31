import { useState } from "react";
import { useTests } from "../services/tests.service";
import type { CreateTemplateRequest } from "../services/types";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: CreateTemplateRequest) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreateTemplateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}: CreateTemplateModalProps) {
  const [newTemplate, setNewTemplate] = useState<CreateTemplateRequest>({
    name: "",
    testIds: [],
    storyIds: []
  });
  const { data: tests, isLoading: isLoadingTests } = useTests();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newTemplate);
    setNewTemplate({ name: "", testIds: [], storyIds: [] });
  };

  const toggleTestSelection = (testId: number) => {
    setNewTemplate(prev => ({
      ...prev,
      testIds: prev.testIds.includes(testId)
        ? prev.testIds.filter(id => id !== testId)
        : [...prev.testIds, testId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Template</h2>
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
              Template Name
            </label>
            <input
              type="text"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Tests
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border p-2 rounded">
              {isLoadingTests ? (
                <div>Loading tests...</div>
              ) : (
                tests?.map((test) => (
                  <label key={test.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newTemplate.testIds.includes(test.id)}
                      onChange={() => toggleTestSelection(test.id)}
                      className="rounded"
                    />
                    <span>{test.name}</span>
                  </label>
                ))
              )}
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
              {isSubmitting ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}