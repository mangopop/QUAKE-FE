// Section.tsx
interface SectionProps {
  section: {
    name: string;
    status: 'not_tested' | 'passed' | 'failed';
    notes: string;
  };
  index: number;
  updateSection: (index: number, key: keyof SectionProps['section'], value: string | 'not_tested' | 'passed' | 'failed') => void;
}

export default function Section({ section, index, updateSection }: SectionProps) {
  return (
    <div className="p-2 border-t">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={section.name}
          onChange={(e) => updateSection(index, 'name', e.target.value)}
          placeholder="Section Name"
          className="border p-1 rounded"
        />
        <div className="flex items-center gap-2">
          <select
            value={section.status}
            onChange={(e) => updateSection(index, 'status', e.target.value as 'not_tested' | 'passed' | 'failed')}
            className="border p-1 rounded"
          >
            <option value="not_tested">Not Tested</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      <textarea
        value={section.notes}
        onChange={(e) => updateSection(index, 'notes', e.target.value)}
        placeholder="Notes"
        className="w-full border p-1 rounded text-sm"
      />
    </div>
  );
}
