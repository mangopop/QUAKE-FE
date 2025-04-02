import React from 'react';

interface Item {
  id: number;
  name: string;
  description?: string;
}

interface CheckboxListProps<T extends Item> {
  label: string;
  items?: T[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  isLoading?: boolean;
  maxHeight?: string;
}

export default function CheckboxList<T extends Item>({
  label,
  items,
  selectedIds,
  onToggle,
  isLoading = false,
  maxHeight = "48"
}: CheckboxListProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className={`space-y-2 max-h-${maxHeight} overflow-y-auto border p-4 rounded-lg bg-gray-50`}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          items?.map((item) => (
            <label key={item.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => onToggle(item.id)}
                className="rounded"
              />
              <div>
                <div className="font-medium">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-gray-500">{item.description}</div>
                )}
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}