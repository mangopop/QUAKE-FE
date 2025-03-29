// Section.tsx
interface SectionProps {
  index: number;
  section: {
    name: string;
    description: string;
  };
  updateSection: (index: number, key: 'name' | 'description', value: string) => void;
}

export default function Section({ index, section, updateSection }: SectionProps) {
  return (
    <div className="border p-4 rounded mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Section {index + 1}</h3>
        <button
          onClick={() => {
            // TODO: Implement section deletion
          }}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Section Name</label>
          <input
            type="text"
            value={section.name}
            onChange={(e) => updateSection(index, 'name', e.target.value)}
            className="mt-1 block w-full border rounded-md shadow-sm p-2"
            placeholder="Enter section name"
            autoComplete="off"
            data-form-type="other"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={section.description}
            onChange={(e) => updateSection(index, 'description', e.target.value)}
            className="mt-1 block w-full border rounded-md shadow-sm p-2"
            placeholder="Enter section description"
            rows={3}
            autoComplete="off"
            data-form-type="other"
          />
        </div>
      </div>
    </div>
  );
}
