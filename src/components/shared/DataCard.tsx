import React from 'react';
import type { Owner } from '../../services/types';
import DeleteIcon from '../common/DeleteIcon';
import EditIcon from '../common/EditIcon';
import ActionButtons from '../ActionButtons';

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
          <ActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
          />
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