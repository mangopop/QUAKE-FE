import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTest, useUpdateTest } from "../services/tests.service";
import { useTemplates } from "../services/templates.service";
import { useCategories } from "../services/categories.service";
import type { Test, CreateTestRequest, Category, Template } from "../services/types";
import FormInput from "../components/common/FormInput";
import FormCheckboxGroup from "../components/common/FormCheckboxGroup";
import FormSelect from "../components/common/FormSelect";
import ButtonGroup from "../components/common/ButtonGroup";
import SectionForm, { Section } from "../components/common/SectionForm";

export default function EditTest() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { data: test, isLoading: isLoadingTest } = useTest(testId || "0");
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { data: categories } = useCategories();
  const updateTest = useUpdateTest();

  const [formData, setFormData] = useState<CreateTestRequest>({
    name: "",
    description: "",
    templateId: undefined,
    sections: [],
    categories: []
  });

  useEffect(() => {
    if (test) {
      setFormData({
        name: test.name,
        description: test.description || "",
        templateId: test.templateId,
        sections: test.sections?.length ? test.sections.map(section => ({
          name: section.name,
          description: section.description,
          orderIndex: section.orderIndex
        })) : [],
        categories: test.categories.map(cat => typeof cat === 'string' ? cat : cat.id.toString())
      });
    }
  }, [test]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId) return;

    try {
      await updateTest.mutateAsync({ id: Number(testId), data: formData });
      navigate("/tests");
    } catch (error) {
      console.error('Failed to update test:', error);
    }
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { name: "", description: "", orderIndex: prev.sections.length }]
    }));
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.length > 1
        ? prev.sections.filter((_, i) => i !== index).map((section, i) => ({ ...section, orderIndex: i }))
        : [{ name: "", description: "", orderIndex: 0 }]
    }));
  };

  if (isLoadingTest || isLoadingTemplates) {
    return <div className="p-4">Loading...</div>;
  }

  if (!test) {
    return <div className="p-4">Test not found</div>;
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Test</h2>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Test Name"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="Enter test name"
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter test description"
                className="w-full border rounded p-2 min-h-[100px]"
              />
            </div>

            <FormCheckboxGroup
              label="Categories"
              options={categories?.map(category => ({
                id: category.id.toString(),
                label: category.name
              })) || []}
              selectedValues={formData.categories}
              onChange={(selectedIds) => setFormData(prev => ({ ...prev, categories: selectedIds }))}
            />

            <SectionForm
              sections={formData.sections}
              onAddSection={addSection}
              onRemoveSection={removeSection}
              onUpdateSection={updateSection}
            />

            <ButtonGroup
              onSubmit={handleSubmit}
              onCancel={() => navigate("/tests")}
              submitText={updateTest.isPending ? 'Saving...' : 'Save Changes'}
              isSubmitDisabled={updateTest.isPending}
            />
          </form>
        </div>
      </div>
    </div>
  );
}