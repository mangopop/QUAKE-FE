import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Section from "../components/Section";
import TemplateSelect from "../components/TemplateSelect";

interface Section {
  name: string;
  status: 'not_tested' | 'passed' | 'failed';
  notes: string;
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
    setSections([...sections, { name: "", status: 'not_tested', notes: "" }]);
  };

  const updateSection = (index: number, key: keyof Section, value: string | 'not_tested' | 'passed' | 'failed') => {
    const newSections = sections.map((section, i) =>
      i === index ? { ...section, [key]: value } : section
    );
    setSections(newSections);
  };

  const handleSubmit = () => {
    const testEntry = {
      id: Date.now().toString(), // Temporary ID generation
      title,
      template,
      sections,
      createdAt: new Date().toISOString()
    };

    // Here you would typically save to your backend
    console.log("Submitting test entry:", testEntry);

    // Navigate back to the list view
    navigate("/tests");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">New Test Entry</h2>
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
      <button onClick={addSection} className="bg-green-500 text-white p-2 rounded mb-2">Add Section</button>
      <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded">Submit Test</button>
    </div>
  );
}