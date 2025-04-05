import { ReactNode } from 'react';
import OwnerInfo from './OwnerInfo';
import ActionButtons from './ActionButtons';

interface CardProps {
  title?: string;
  owner?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  children?: ReactNode;
  metadata?: {
    label: string;
    value: string | number;
    className?: string;
  }[];
  actionButton?: {
    label: string;
    onClick: () => void;
    icon: ReactNode;
  };
  notes?: string;
  tags?: {
    text: string;
    className?: string;
  }[];
  sections?: {
    name: string;
    description?: string;
    className?: string;
  }[];
  className?: string;
}

export default function Card({
  title,
  owner,
  onEdit,
  onDelete,
  children,
  metadata,
  actionButton,
  notes,
  tags,
  sections,
  className = ''
}: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors flex flex-col h-full ${className}`}>
      <div className="p-4 flex-1 flex flex-col">
        {(title || owner || onEdit || onDelete) && (
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              {title && <h3 className="text-lg font-semibold text-gray-900 mb-1 break-words">{title}</h3>}
              {owner && <OwnerInfo owner={owner} />}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {(onEdit || onDelete) && (
                <ActionButtons
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
            </div>
          </div>
        )}

        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-3">
            {metadata.map((item, index) => (
              <div key={index} className={`text-sm text-gray-600 ${item.className || ''}`}>
                <span className={`font-medium ${item.className || ''}`}>{item.value}</span> {item.label}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 flex-1">
          {notes && (
            <p className="text-sm text-gray-500">{notes}</p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${tag.className || 'bg-blue-50 text-blue-700 border border-blue-100'}`}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          )}
          {children}
          {sections && sections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section, index) => (
                <div key={index} className={`bg-gray-50 rounded-lg p-3 ${section.className || ''}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{section.name}</h4>
                      {section.description && (
                        <p className="text-sm text-gray-500">{section.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {actionButton && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={actionButton.onClick}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
            >
              {actionButton.icon}
              {actionButton.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}