// TestCard.tsx
import Section from './Section'; // Make sure Section component is available for sections

export default function TestCard({ test }) {
  return (
    <div className="p-4 border rounded shadow-md mb-4">
      <h3 className="text-lg font-bold">{test.title}</h3>
      <div className="text-sm text-gray-600 mb-2">
        <p>Template: {test.template || "None"}</p>
        {test.owner && (
          <p>Owner: {test.owner.firstName} {test.owner.lastName} ({test.owner.email})</p>
        )}
      </div>

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
