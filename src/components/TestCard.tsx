// TestCard.tsx
import { Test } from "../services/types";
import OwnerInfo from "./OwnerInfo";
import ActionButtons from "./ActionButtons";
import Card from "./Card";

interface TestCardProps {
  test: Test;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TestCard({ test, onEdit, onDelete }: TestCardProps) {
  return (
    <Card>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
            <span className="text-sm text-gray-600">
              <span className="font-medium">{test.sections?.length || 0}</span> sections
            </span>
            <span className="text-sm text-gray-600">
              <span className="font-medium">{test.categories?.length || 0}</span> categories
            </span>
            {test.owner && <OwnerInfo owner={test.owner} />}
          </div>
          {test.notes && (
            <p className="text-sm text-gray-500">{test.notes}</p>
          )}
          {test.categories && test.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {test.categories.map((category, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {typeof category === 'string' ? category : category.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <ActionButtons
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <div className="space-y-3">
        {test.sections.map((section, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">{section.name}</h4>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
