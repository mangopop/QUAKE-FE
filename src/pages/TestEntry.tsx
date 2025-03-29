import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Section from "../components/Section";
import TemplateSelect from "../components/TemplateSelect";

interface Section {
  name: string;
  description: string;
}

interface Template {
  id: string;
  name: string;
}

export default function NewTestEntry() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const templates: Template[] = [
    { id: "1", name: "Login Flow" },
    { id: "2", name: "Checkout Process" }
  ];

  const addSection = () => {
    setSections([...sections, { name: "", description: "" }]);
  };

  const updateSection = (index: number, key: keyof Section, value: string) => {
    const newSections = sections.map((section, i) =>
      i === index ? { ...section, [key]: value } : section
    );
    setSections(newSections);
  };

  const handleSubmit = () => {
    const testEntry = {
      id: Date.now().toString(),
      title,
      template,
      sections,
      createdAt: new Date().toISOString()
    };

    // Get existing tests from localStorage
    const existingTests = JSON.parse(localStorage.getItem('tests') || '[]');

    // Add the new test to the array
    const updatedTests = [...existingTests, testEntry];

    // Save back to localStorage
    localStorage.setItem('tests', JSON.stringify(updatedTests));

    // Navigate to the test list view
    navigate("/tests");
  };

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
        placeholder="Test Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <TemplateSelect template={template} setTemplate={setTemplate} templates={templates} />
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
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Test
        </button>
      </div>
    </div>
  );
}