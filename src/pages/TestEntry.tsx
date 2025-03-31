import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Section from "../components/Section";
import TemplateSelect from "../components/TemplateSelect";
import { useTemplates, useTemplate } from "../services/templates.service";
import { useCreateTest } from "../services/tests.service";
import type { Section as SectionType, Template } from "../services/types";

export default function NewTestEntry() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [sections, setSections] = useState<SectionType[]>([]);

  const { data: templatesData, isLoading: isLoadingTemplates } = useTemplates();
  const { data: selectedTemplate, isLoading: isLoadingTemplate } = useTemplate(templateId);
  const createTest = useCreateTest();

  const addSection = () => {
    setSections([...sections, { name: "", description: "" }]);
  };

  const updateSection = (index: number, key: keyof SectionType, value: string) => {
    const newSections = sections.map((section, i) =>
      i === index ? { ...section, [key]: value } : section
    );
    setSections(newSections);
  };

  const handleTemplateChange = (templateId: string) => {
    setTemplateId(templateId);
    if (templateId && selectedTemplate?.data) {
      setSections(selectedTemplate.data.sections.map(section => ({
        ...section,
        description: section.description
      })));
    } else {
      setSections([]);
    }
  };

  const handleSubmit = async () => {
    try {
      await createTest.mutateAsync({
        name,
        templateId: templateId || undefined,
        sections,
      });
      navigate("/tests");
    } catch (error) {
      console.error('Failed to create test:', error);
      // You might want to show an error message to the user here
    }
  };

  if (isLoadingTemplates) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create New Test</h2>
        <button
          onClick={() => navigate("/tests")}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      <input
        type="text"
        placeholder="Test Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Template (Optional)
        </label>
        <TemplateSelect
          template={templateId}
          setTemplate={handleTemplateChange}
          templates={templatesData?.data || []}
        />
      </div>
      <div className="mb-4">
        {sections.map((section, index) => (
          <Section
            key={index}
            index={index}
            section={section}
            updateSection={updateSection}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={addSection}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Add Section
        </button>
        <button
          onClick={handleSubmit}
          disabled={createTest.isPending}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createTest.isPending ? 'Creating...' : 'Create Test'}
        </button>
      </div>
    </div>
  );
}