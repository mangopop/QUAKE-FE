import { useState } from "react";
import { useCreateTemplate } from "../services/templates.service";
import { useTests } from "../services/tests.service";
import type { CreateTemplateRequest } from "../services/types";
import Modal from "./common/Modal";
import FormInput from "./common/FormInput";
import FormCheckboxGroup from "./common/FormCheckboxGroup";
import ButtonGroup from "./common/ButtonGroup";

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
          required
        />

        <FormCheckboxGroup
          label="Select Tests"
          options={tests?.data?.map(test => ({
            id: test.id.toString(),
            label: `${test.name} (${test.sections.length} sections)`
          })) || []}
          selectedValues={selectedTestIds}
          onChange={setSelectedTestIds}
        />

        <ButtonGroup
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitText="Create Template"
          isSubmitDisabled={!name.trim()}
        />
      </form>
    </Modal>
  );
}