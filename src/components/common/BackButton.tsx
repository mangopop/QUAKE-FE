import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ to = '/stories', label = 'Back to Stories', className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ${className}`}
    >
      {label}
    </button>
  );
}