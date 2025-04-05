import { useState } from "react";
import { useCreateTest } from "../services/tests.service";
import { useCategories } from "../services/categories.service";
import type { CreateTestRequest, Category } from "../services/types";
import Modal from "./common/Modal";
import FormInput from "./common/FormInput";
import Button from "./common/Button";
import SectionForm, { Section } from "./common/SectionForm";

interface ValidationErrors {
  name?: string;
  sections?: { [key: number]: string };
}

interface CreateTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTestModal({ isOpen, onClose }: CreateTestModalProps) {
  const createTest = useCreateTest();
  const { data: categories } = useCategories();
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([{ name: "", description: "", orderIndex: 0 }]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate test name
    if (!name.trim()) {
      newErrors.name = "Test name is required";
      isValid = false;
    }

    // Validate sections
    const sectionErrors: { [key: number]: string } = {};
    sections.forEach((section, index) => {
      if (!section.name.trim()) {
        sectionErrors[index] = "Section name is required";
        isValid = false;
      }
    });
    if (Object.keys(sectionErrors).length > 0) {
      newErrors.sections = sectionErrors;
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
      const testData: CreateTestRequest = {
        name: name.trim(),
        sections: sections.map((section, index) => ({
          ...section,
          orderIndex: index
        })),
        categories: selectedCategories
      };
      await createTest.mutateAsync(testData);
      onClose();
      // Reset form
      setName("");
      setSelectedCategories([]);
      setSections([{ name: "", description: "", orderIndex: 0 }]);
      setErrors({});
    } catch (error) {
      console.error("Failed to create test:", error);
    }
  };

  const addSection = () => {
    setSections([...sections, { name: "", description: "", orderIndex: sections.length }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
    // Clear any errors for the removed section
    if (errors.sections?.[index]) {
      const newErrors = { ...errors };
      if (newErrors.sections) {
        delete newErrors.sections[index];
      }
      setErrors(newErrors);
    }
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);

    // Clear error when user types
    if (field === 'name' && errors.sections?.[index]) {
      const newErrors = { ...errors };
      if (newErrors.sections) {
        delete newErrors.sections[index];
      }
      setErrors(newErrors);
    }
  };

  const isFormValid = name.trim() !== "" && sections.every(section => section.name.trim() !== "");

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Test">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Name"
          value={name}
          onChange={(value) => {
            setName(value);
            if (errors.name) {
              setErrors({ ...errors, name: undefined });
            }
          }}
          error={errors.name}
          placeholder="Enter test name"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
          <div className="space-y-2">
            {categories?.map((category: Category) => (
              <label key={category.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id.toString())}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category.id.toString()]);
                    } else {
                      setSelectedCategories(
                        selectedCategories.filter((id) => id !== category.id.toString())
                      );
                    }
                  }}
                  className="rounded"
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>

        <SectionForm
          sections={sections}
          onAddSection={addSection}
          onRemoveSection={removeSection}
          onUpdateSection={updateSection}
          errors={errors.sections}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={!isFormValid}
          >
            Create Test
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