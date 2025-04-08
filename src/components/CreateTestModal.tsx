import { useState } from "react";
import { useCreateTest } from "../services/tests.service";
import { useCategories, useCreateCategory } from "../services/categories.service";
import type { CreateTestRequest, Category } from "../services/types";
import Modal from "./common/Modal";
import FormInput from "./common/FormInput";
import FormCheckboxGroup from "./common/FormCheckboxGroup";
import ButtonGroup from "./common/ButtonGroup";
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
  const createCategory = useCreateCategory();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
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
        description: description.trim(),
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
      setDescription("");
      setSelectedCategories([]);
      setSections([]);
      setErrors({});
    } catch (error) {
      console.error("Failed to create test:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        description: ""
      });

      // Add the new category to the selected categories
      setSelectedCategories(prev => [...prev, response.data.id.toString()]);
      setNewCategoryName("");
    } catch (error) {
      console.error("Failed to create category:", error);
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
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter test description"
            className="w-full border rounded p-2 min-h-[100px]"
          />
        </div>

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
            selectedValues={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        <SectionForm
          sections={sections}
          onAddSection={addSection}
          onRemoveSection={removeSection}
          onUpdateSection={updateSection}
          errors={errors.sections}
        />

        <ButtonGroup
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitText="Create Test"
          isSubmitDisabled={!isFormValid}
        />
      </form>
    </Modal>
  );
}