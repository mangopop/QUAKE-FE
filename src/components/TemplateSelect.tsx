interface Template {
  id: string;
  name: string;
  sections: {
    name: string;
    description: string;
  }[];
}

interface TemplateSelectProps {
  template: string;
  setTemplate: (templateId: string) => void;
  templates: Template[];
}

export default function TemplateSelect({ template, setTemplate, templates }: TemplateSelectProps) {
  return (
    <select
      className="mb-4 w-full p-2 border rounded"
      value={template}
      onChange={(e) => setTemplate(e.target.value)}
    >
      <option value="">Select Template</option>
      {templates && templates.map((temp) => (
        <option key={temp.id} value={temp.id}>{temp.name}</option>
      ))}
    </select>
  );
}
