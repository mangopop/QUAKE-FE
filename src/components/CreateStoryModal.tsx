import { useState } from "react";
import { useTemplates } from "../services/stories.service";
import { useCategories } from "../services/categories.service";
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
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

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

        <FormCheckboxGroup
          label="Categories"
          options={categories?.map(category => ({
            id: category.id.toString(),
            label: category.name
          })) || []}
          selectedValues={newStory.categoryIds.map(id => id.toString())}
          onChange={handleCategoryChange}
          error={isLoadingCategories ? "Loading categories..." : undefined}
        />

        <FormCheckboxGroup
          label="Select Templates"
          options={templates?.map(template => ({
            id: template.id.toString(),
            label: template.name
          })) || []}
          selectedValues={newStory.templateIds.map(id => id.toString())}
          onChange={handleTemplateChange}
          error={isLoadingTemplates ? "Loading templates..." : undefined}
        />

        <ButtonGroup
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitText={isSubmitting ? 'Creating...' : 'Create Story'}
          isSubmitDisabled={isSubmitting || !newStory.name.trim()}
        />
      </form>
    </Modal>
  );
}