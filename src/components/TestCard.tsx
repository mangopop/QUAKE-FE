// TestCard.tsx
import type { Test } from '../services/types';
import Section from './Section';

interface TestCardProps {
  test: Test;
}

// Mock section component for display only
function ReadOnlySection({ section, index }: { section: { name: string; description: string }; index: number }) {
  return (
    <div data-testid="mock-section" data-index={index}>
      {section.name}
    </div>
  );
}

export default function TestCard({ test }: TestCardProps) {
  return (
    <div className="p-4 border rounded shadow-md mb-4">
      <h3 className="text-lg font-bold">{test.name}</h3>
      <div className="text-sm text-gray-600 mb-2">
        <p>Template: {test.template || "None"}</p>
        {test.owner && (
          <p>Owner: {test.owner.firstName} {test.owner.lastName}</p>
        )}
        {test.notes && (
          <p className="mt-1">{test.notes}</p>
        )}
      </div>

      <div className="mt-2">
        {test.sections.map((section, index) => (
          <ReadOnlySection
            key={index}
            section={section}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
