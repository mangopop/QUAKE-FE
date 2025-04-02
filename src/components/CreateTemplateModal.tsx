import { useState } from "react";
import { useCreateTemplate } from "../services/templates.service";
import { useTests } from "../services/tests.service";
import type { CreateTemplateRequest } from "../services/types";
import Modal from "./common/Modal";
import FormInput from "./common/FormInput";
import Button from "./common/Button";
import CheckboxList from "./common/CheckboxList";

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

  const toggleTestSelection = (testId: number) => {
    const stringId = testId.toString();
    setSelectedTestIds(prev =>
      prev.includes(stringId)
        ? prev.filter(id => id !== stringId)
        : [...prev, stringId]
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Template">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Name"
          value={name}
          onChange={(value) => {
            setName(value);
            if (errors.name) {
              setErrors({});
            }
          }}
          error={errors.name}
          placeholder="Enter template name"
        />

        <CheckboxList
          label="Select Tests"
          items={tests?.data?.map(test => ({
            ...test,
            description: `${test.sections.length} sections`
          }))}
          selectedIds={selectedTestIds.map(id => parseInt(id, 10))}
          onToggle={toggleTestSelection}
          maxHeight="96"
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={!name.trim()}
          >
            Create Template
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