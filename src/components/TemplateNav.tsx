import { useState } from 'react';

interface TemplateNavProps {
  onImport: (file: File) => void;
  onExport: () => void;
  onManageCategories: () => void;
}

export default function TemplateNav({ onImport, onExport, onManageCategories }: TemplateNavProps) {
  const [showImportInput, setShowImportInput] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      setShowImportInput(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 flex items-center gap-2">
        <button
          onClick={onManageCategories}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
        >
          Manage Categories
        </button>
        <button
          onClick={() => setShowImportInput(true)}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
        >
          Import Templates
        </button>
        <button
          onClick={onExport}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
        >
          Export Templates
        </button>
      </div>
      {showImportInput && (
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          id="template-import"
        />
      )}
    </div>
  );
}