import { ReactNode } from 'react';
import OwnerInfo from './OwnerInfo';

interface CardProps {
  title: string;
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
  sections
}: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            {metadata?.map((item, index) => (
              <div key={index} className="text-sm text-gray-600">
                <span className="font-medium">{item.value}</span> {item.label}
              </div>
            ))}
            {owner && <OwnerInfo owner={owner} />}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gray-500 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition-colors"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
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
            <div className="space-y-3">
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