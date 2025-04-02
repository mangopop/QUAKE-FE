import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTemplates, useUpdateTemplate } from "../services/templates.service";
import { useTests } from "../services/tests.service";
import type { Template, Test } from "../services/types";

export default function EditTemplate() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { data: testsData, isLoading: isLoadingTests } = useTests();
  const updateTemplate = useUpdateTemplate();

  const [template, setTemplate] = useState<Template | null>(null);
  const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (templates && templateId) {
      const foundTemplate = templates.find(t => t.id === parseInt(templateId));
      if (foundTemplate) {
        setTemplate(foundTemplate);
        setSelectedTestIds(foundTemplate.tests.map(test => test.id));
      }
    }
  }, [templates, templateId]);

  if (isLoadingTemplates || isLoadingTests) {
    return <div>Loading...</div>;
  }

  if (!template || !testsData?.data) {
    return <div>Template not found</div>;
  }

  const handleSave = async () => {
    try {
      await updateTemplate.mutateAsync({
        id: templateId!,
        data: {
          name: template.name,
          testIds: selectedTestIds,
          storyIds: [] // Since we're not managing stories in this form, we'll keep the existing ones
        }
      });
      navigate('/templates');
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const toggleTestSelection = (testId: number) => {
    setSelectedTestIds(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const filteredTests = testsData.data.filter((test: Test) =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Template</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/templates')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name
          </label>
          <input
            type="text"
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Tests
          </label>
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Tests</h3>
          <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
            {filteredTests.map((test: Test) => (
              <label key={test.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={selectedTestIds.includes(test.id)}
                  onChange={() => toggleTestSelection(test.id)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{test.name}</div>
                  {test.notes && (
                    <div className="text-sm text-gray-500">{test.notes}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}