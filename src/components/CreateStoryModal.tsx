import { useState } from "react";
import { useTemplates } from "../services/stories.service";
import { useCategories } from "../services/categories.service";
import type { CreateStoryRequest, Category } from "../services/types";
import Modal from "./common/Modal";
import FormInput from "./common/FormInput";
import Button from "./common/Button";
import CheckboxList from "./common/CheckboxList";

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
    templateIds: [],
    categoryIds: []
  });
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newStory);
    setNewStory({ name: "", templateIds: [], categoryIds: [] });
  };

  const toggleTemplateSelection = (templateId: number) => {
    setNewStory(prev => ({
      ...prev,
      templateIds: prev.templateIds.includes(templateId)
        ? prev.templateIds.filter(id => id !== templateId)
        : [...prev.templateIds, templateId]
    }));
  };

  const toggleCategorySelection = (categoryId: number) => {
    setNewStory(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Story">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Story Name"
          value={newStory.name}
          onChange={(value) => setNewStory(prev => ({ ...prev, name: value }))}
          placeholder="Enter story name"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
          <div className="space-y-2">
            {isLoadingCategories ? (
              <div className="text-sm text-gray-500">Loading categories...</div>
            ) : categories && categories.length > 0 ? (
              categories.map((category: Category) => (
                <label key={category.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newStory.categoryIds.includes(category.id)}
                    onChange={() => toggleCategorySelection(category.id)}
                    className="rounded"
                  />
                  {category.name}
                </label>
              ))
            ) : (
              <div className="text-sm text-gray-500">No categories available</div>
            )}
          </div>
        </div>

        <CheckboxList
          label="Select Templates"
          items={templates}
          selectedIds={newStory.templateIds}
          onToggle={toggleTemplateSelection}
          isLoading={isLoadingTemplates}
          maxHeight="48"
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !newStory.name.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Story'}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}