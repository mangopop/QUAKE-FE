import React from 'react';
import DeleteIcon from './common/DeleteIcon';
import EditIcon from './common/EditIcon';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ActionButtons({ onEdit, onDelete }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-gray-500 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition-colors"
          title="Edit"
        >
          <EditIcon />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <DeleteIcon />
        </button>
      )}
    </div>
  );
}