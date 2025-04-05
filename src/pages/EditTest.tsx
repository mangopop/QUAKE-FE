import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTest, useUpdateTest } from "../services/tests.service";
import { useTemplates } from "../services/templates.service";
import { useCategories } from "../services/categories.service";
import type { Test, CreateTestRequest, Category, Template } from "../services/types";
import FormInput from "../components/common/FormInput";
import Button from "../components/common/Button";
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
    templateId: undefined,
    sections: [{ name: "", description: "", orderIndex: 0 }],
    categories: []
  });

  useEffect(() => {
    if (test) {
      setFormData({
        name: test.name,
        templateId: test.templateId,
        sections: test.sections?.length ? test.sections.map(section => ({
          name: section.name,
          description: section.description,
          orderIndex: section.orderIndex
        })) : [{ name: "", description: "", orderIndex: 0 }],
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
      <h2 className="text-xl font-bold mb-4">Edit Test</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Test Name"
          value={formData.name}
          onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
          placeholder="Enter test name"
          required
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
                  checked={formData.categories.includes(category.id.toString())}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        categories: [...prev.categories, category.id.toString()]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        categories: prev.categories.filter(id => id !== category.id.toString())
                      }));
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template (Optional)
          </label>
          <select
            value={formData.templateId || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value ? e.target.value : undefined }))}
            className="border p-2 rounded w-full"
          >
            <option value="">Select a template...</option>
            {templates?.data?.map((template: Template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <SectionForm
          sections={formData.sections}
          onAddSection={addSection}
          onRemoveSection={removeSection}
          onUpdateSection={updateSection}
        />

        <div className="flex justify-end gap-4">
          <Button
            onClick={() => navigate("/tests")}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateTest.isPending}
          >
            {updateTest.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}