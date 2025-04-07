import React, { useState } from 'react';
import StatusButton from './StatusButton';
import NotesSection from './NotesSection';
import SectionCard from './SectionCard';

interface TestCardProps {
  test: {
    id: number;
    name: string;
    sections: Array<{
      id: number;
      name: string;
      description?: string;
    }>;
  };
  status: string;
  onStatusChange: (status: 'passed' | 'failed') => void;
  onSaveNote: (note: string) => void;
  sectionResults: {
    [key: number]: {
      status: string;
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
    };
  };
  onSectionStatusChange: (testId: number, sectionId: number, status: 'not_tested' | 'passed' | 'failed') => void;
  onSaveSectionNote: (testId: number, sectionId: number, note: string) => void;
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

export default function TestCard({
  test,
  status,
  onStatusChange,
  onSaveNote,
  sectionResults,
  onSectionStatusChange,
  onSaveSectionNote,
  notes,
  initialNotesShown = 2,
  maxLinesBeforeCollapse = 20,
  disabled = false,
  className = ''
}: TestCardProps) {
  const [expandedSectionNotes, setExpandedSectionNotes] = useState<Set<string>>(new Set());

  const toggleSectionNotes = (testId: number, sectionId: number) => {
    const key = `${testId}-${sectionId}`;
    setExpandedSectionNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`} data-testid="test-card">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{test.name}</h3>
        </div>
        <div className="flex space-x-2">
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
        </div>
      </div>

      {test.sections && test.sections.length > 0 && (
        <div className="mt-4 space-y-2">
          {test.sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              status={sectionResults[section.id]?.status || 'not_tested'}
              onStatusChange={(status) => onSectionStatusChange(test.id, section.id, status)}
              onSaveNote={(note) => onSaveSectionNote(test.id, section.id, note)}
              notes={sectionResults[section.id]?.notes || []}
              initialNotesShown={initialNotesShown}
              maxLinesBeforeCollapse={maxLinesBeforeCollapse}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      <div className="mt-3">
        <NotesSection
          notes={notes}
          onSaveNote={onSaveNote}
          initialNotesShown={initialNotesShown}
          maxLinesBeforeCollapse={maxLinesBeforeCollapse}
          disabled={disabled}
        />
      </div>
    </div>
  );
}