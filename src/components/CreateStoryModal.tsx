import { useState } from "react";
import { useTemplates } from "../services/stories.service";
import { useCategories, useCreateCategory } from "../services/categories.service";
import type { CreateStoryRequest, Category } from "../services/types";
import Modal from "./common/Modal";
import FormInput from "./common/FormInput";
import FormCheckboxGroup from "./common/FormCheckboxGroup";
import ButtonGroup from "./common/ButtonGroup";

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
  const [newCategoryName, setNewCategoryName] = useState("");
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const createCategory = useCreateCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newStory);
    setNewStory({ name: "", templateIds: [], categoryIds: [] });
  };

  const handleCategoryChange = (selectedIds: string[]) => {
    setNewStory(prev => ({
      ...prev,
      categoryIds: selectedIds.map(id => parseInt(id, 10))
    }));
  };

  const handleTemplateChange = (selectedIds: string[]) => {
    setNewStory(prev => ({
      ...prev,
      templateIds: selectedIds.map(id => parseInt(id, 10))
    }));
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        description: ""
      });

      // Add the new category to the selected categories
      setNewStory(prev => ({
        ...prev,
        categoryIds: [...prev.categoryIds, response.data.id]
      }));

      setNewCategoryName("");
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Story"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Story Name"
          value={newStory.name}
          onChange={(value) => setNewStory(prev => ({ ...prev, name: value }))}
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Categories</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="flex-1 border rounded p-2"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!newCategoryName.trim() || createCategory.isPending}
            >
              Add
            </button>
          </div>
          <FormCheckboxGroup
            label="Select Categories"
            options={categories?.map(cat => ({
              id: cat.id.toString(),
              label: cat.name
            })) || []}
            selectedValues={newStory.categoryIds.map(id => id.toString())}
            onChange={handleCategoryChange}
          />
        </div>

        <FormCheckboxGroup
          label="Select Templates"
          options={templates?.map(template => ({
            id: template.id.toString(),
            label: template.name
          })) || []}
          selectedValues={newStory.templateIds.map(id => id.toString())}
          onChange={handleTemplateChange}
        />

        <ButtonGroup
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitText={isSubmitting ? "Creating..." : "Create Story"}
          isSubmitDisabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}