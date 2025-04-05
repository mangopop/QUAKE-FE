import React from 'react';

interface NoteButtonProps {
  isExpanded: boolean;
  onClick: () => void;
  count?: number;
  className?: string;
}

export default function NoteButton({ isExpanded, onClick, count, className = '' }: NoteButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1 ${className}`}
    >
      {isExpanded ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Hide Notes
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {count ? `Show More (${count} more)` : 'Add Notes'}
        </>
      )}
    </button>
  );
}