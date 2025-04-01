import { useState } from "react";
import { useTemplates } from "../services/stories.service";
import type { CreateStoryRequest } from "../services/types";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (story: CreateStoryRequest) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreateStoryModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}: CreateStoryModalProps) {
  const [newStory, setNewStory] = useState<CreateStoryRequest>({
    name: "",
    templateIds: []
  });
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newStory);
    setNewStory({ name: "", templateIds: [] });
  };

  const toggleTemplateSelection = (templateId: number) => {
    setNewStory(prev => ({
      ...prev,
      templateIds: prev.templateIds.includes(templateId)
        ? prev.templateIds.filter(id => id !== templateId)
        : [...prev.templateIds, templateId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Story</h2>
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
              Story Name
            </label>
            <input
              type="text"
              value={newStory.name}
              onChange={(e) => setNewStory(prev => ({ ...prev, name: e.target.value }))}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Templates
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border p-2 rounded">
              {isLoadingTemplates ? (
                <div>Loading templates...</div>
              ) : (
                templates?.map((template) => (
                  <label key={template.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newStory.templateIds.includes(template.id)}
                      onChange={() => toggleTemplateSelection(template.id)}
                      className="rounded"
                    />
                    <span>{template.name}</span>
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
              {isSubmitting ? 'Creating...' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}