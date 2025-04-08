import React from 'react';

interface StatusButtonProps {
  status: 'passed' | 'failed' | 'not_tested';
  currentStatus?: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const statusColors = {
  passed: {
    active: 'bg-green-500 text-white',
    inactive: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  },
  failed: {
    active: 'bg-red-500 text-white',
    inactive: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  },
  not_tested: {
    active: 'bg-gray-500 text-white',
    inactive: 'text-gray-500 hover:text-gray-800'
  }
};

export default function StatusButton({ status, currentStatus, onClick, className = '', disabled = false }: StatusButtonProps) {
  const isActive = currentStatus === status;
  const colors = statusColors[status];
  const baseStyles = 'px-3 py-1 rounded-full text-sm font-medium cursor-pointer';

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${isActive ? colors.active : colors.inactive} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
}