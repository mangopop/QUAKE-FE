import React, { useState } from 'react';
import StatusButton from './StatusButton';
import NoteButton from './NoteButton';
import NotesSection from './NotesSection';

interface SectionCardProps {
  section: {
    id: number;
    name: string;
    description?: string;
  };
  status: string;
  onStatusChange: (status: 'passed' | 'failed' | 'not_tested') => void;
  onSaveNote: (note: string) => void;
  notes: Array<{
    id: number;
    note: string;
    createdAt: string;
    createdBy: {
      id: number;
      firstName: string;
      lastName: string;
      email?: string;
    };
  }>;
  initialNotesShown?: number;
  maxLinesBeforeCollapse?: number;
  disabled?: boolean;
  className?: string;
}

export default function SectionCard({
  section,
  status,
  onStatusChange,
  onSaveNote,
  notes,
  initialNotesShown = 2,
  maxLinesBeforeCollapse = 20,
  disabled = false,
  className = ''
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-gray-50 p-4 rounded ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{section.name}</h4>
          {section.description && (
            <p className="text-sm text-gray-600">{section.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <StatusButton
            status="not_tested"
            currentStatus={status}
            onClick={() => onStatusChange('not_tested')}
            disabled={disabled}
          />
          <StatusButton
            status="passed"
            currentStatus={status}
            onClick={() => onStatusChange('passed')}
            disabled={disabled}
          />
          <StatusButton
            status="failed"
            currentStatus={status}
            onClick={() => onStatusChange('failed')}
            disabled={disabled}
          />
          <NoteButton
            isExpanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3">
          <NotesSection
            notes={notes}
            onSaveNote={onSaveNote}
            initialNotesShown={initialNotesShown}
            maxLinesBeforeCollapse={maxLinesBeforeCollapse}
          />
        </div>
      )}
    </div>
  );
}