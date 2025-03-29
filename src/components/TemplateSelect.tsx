export default function TemplateSelect({ template, setTemplate, templates }) {
    return (
      <select className="mb-4 w-full p-2 border rounded" value={template} onChange={(e) => setTemplate(e.target.value)}>
        <option value="">Select Template</option>
        {templates.map((temp) => (
          <option key={temp.id} value={temp.id}>{temp.name}</option>
        ))}
      </select>
    );
  }
