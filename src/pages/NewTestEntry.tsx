import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTest } from "../services/tests.service";
import { useCategories } from "../services/categories.service";
import type { CreateTestRequest, Category } from "../services/types";

interface Section {
  name: string;
  description: string;
  orderIndex: number;
}

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
        }))
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            className={`border p-2 rounded w-full ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Enter test name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
          <div className="space-y-2">
            {categories?.data?.map((category: Category) => (
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

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Sections
            </label>
            <button
              type="button"
              onClick={addSection}
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Section
            </button>
          </div>
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Section {index + 1}</h3>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSection(index, "name", e.target.value)}
                      className={`border p-2 rounded w-full ${errors.sections?.[index] ? 'border-red-500' : ''}`}
                      placeholder="Section name"
                    />
                    {errors.sections?.[index] && (
                      <p className="mt-1 text-sm text-red-500">{errors.sections[index]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <textarea
                      value={section.description}
                      onChange={(e) => updateSection(index, "description", e.target.value)}
                      className="border p-2 rounded w-full"
                      rows={2}
                      placeholder="Section description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`px-4 py-2 rounded ${
              isFormValid
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Create Test
          </button>
          <button
            type="button"
            onClick={() => navigate("/tests")}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}