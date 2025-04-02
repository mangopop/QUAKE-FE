import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTest, useUpdateTest } from "../services/tests.service";
import { useTemplates } from "../services/templates.service";
import type { Test, CreateTestRequest } from "../services/types";
import Section from "../components/Section";

export default function EditTest() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { data: test, isLoading: isLoadingTest } = useTest(testId || "0");
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const updateTest = useUpdateTest();

  const [formData, setFormData] = useState<CreateTestRequest>({
    name: "",
    templateId: undefined,
    sections: []
  });

  useEffect(() => {
    if (test) {
      setFormData({
        name: test.name,
        templateId: test.templateId,
        sections: test.sections || []
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
      sections: [...prev.sections, { name: "", description: "" }]
    }));
  };

  const updateSection = (index: number, key: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, [key]: value } : section
      )
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="border p-2 rounded w-full"
            required
          />
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
            {templates && templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Sections
            </label>
            <button
              type="button"
              onClick={addSection}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              + Add Section
            </button>
          </div>
          <div className="space-y-4">
            {formData.sections.map((section, index) => (
              <div key={index} className="border p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Section {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Section Name"
                    value={section.name}
                    onChange={(e) => updateSection(index, 'name', e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <textarea
                    placeholder="Section Description"
                    value={section.description}
                    onChange={(e) => updateSection(index, 'description', e.target.value)}
                    className="border p-2 rounded w-full"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/tests")}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateTest.isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {updateTest.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}