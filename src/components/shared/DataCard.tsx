import React from 'react';
import type { Owner } from '../../services/types';

interface DataCardProps {
  title: string;
  owner: Owner;
  onEdit?: () => void;
  onDelete?: () => void;
  metadata?: Array<{ label: string; value: number | string }>;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
  className?: string;
}

export default function DataCard({
  title,
  owner,
  onEdit,
  onDelete,
  metadata,
  actionButton,
  children,
  className = '',
}: DataCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">
            {owner.firstName} {owner.lastName}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-blue-500 hover:text-blue-600"
              aria-label="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-600"
              aria-label="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {metadata && metadata.length > 0 && (
        <div className="flex gap-4 mb-4">
          {metadata.map((item, index) => (
            <div key={index} className="text-sm text-gray-500">
              <span className="font-medium">{item.label}:</span> {item.value}
            </div>
          ))}
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}

      {actionButton && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={actionButton.onClick}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          >
            {actionButton.icon}
            <span>{actionButton.label}</span>
          </button>
        </div>
      )}
    </div>
  );
}