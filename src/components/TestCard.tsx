// TestCard.tsx
import Section from './Section'; // Make sure Section component is available for sections

export default function TestCard({ test }) {
  return (
    <div className="p-4 border rounded shadow-md mb-4">
      <h3 className="text-lg font-bold">{test.title}</h3>
      <p className="text-gray-600">Template: {test.template || "None"}</p>

      <div className="mt-2">
        {test.sections.map((section, index) => (
          <Section
            key={index}
            section={section}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
