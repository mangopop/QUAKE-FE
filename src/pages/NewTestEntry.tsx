import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTest } from "../services/tests.service";
import { useCategories } from "../services/categories.service";
import type { CreateTestRequest, Category } from "../services/types";
import FormInput from "../components/common/FormInput";
import FormCheckboxGroup from "../components/common/FormCheckboxGroup";
import SectionForm, { Section } from "../components/common/SectionForm";
import ButtonGroup from "../components/common/ButtonGroup";

interface ValidationErrors {
  name?: string;
  sections?: { [key: number]: string };
}

export default function NewTestEntry() {
  const navigate = useNavigate();
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
      navigate("/tests");
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">New Test</h2>
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

        <FormCheckboxGroup
          label="Categories"
          options={categories?.map((category: Category) => ({
            id: category.id.toString(),
            label: category.name
          })) || []}
          selectedValues={selectedCategories}
          onChange={setSelectedCategories}
        />

        <SectionForm
          sections={sections}
          onAddSection={addSection}
          onRemoveSection={removeSection}
          onUpdateSection={updateSection}
          errors={errors.sections}
        />

        <ButtonGroup
          onSubmit={handleSubmit}
          onCancel={() => navigate("/tests")}
          submitText="Create Test"
          isSubmitDisabled={!isFormValid}
        />
      </form>
    </div>
  );
}