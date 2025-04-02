import { useState } from "react";
import { useTemplates } from "../services/stories.service";
import type { CreateStoryRequest } from "../services/types";
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