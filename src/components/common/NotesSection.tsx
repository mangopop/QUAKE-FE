import React, { useState } from 'react';
import NoteButton from './NoteButton';

interface BaseNote {
  id: number;
  note: string;
  createdAt: string;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

interface NotesSectionProps {
  notes: BaseNote[];
  onSaveNote: (note: string) => void;
  initialNotesShown?: number;
  maxLinesBeforeCollapse?: number;
  disabled?: boolean;
  className?: string;
}

export default function NotesSection({
  notes,
  onSaveNote,
  initialNotesShown = 2,
  maxLinesBeforeCollapse = 20,
  disabled = false,
  className = ''
}: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [expandedLongNotes, setExpandedLongNotes] = useState<Set<string>>(new Set());

  const toggleNoteExpansion = (noteId: number) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const toggleLongNoteExpansion = (noteId: string) => {
    setExpandedLongNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const formatNote = (note: string, noteId: string) => {
    const lines = note.split('\n');
    if (lines.length <= maxLinesBeforeCollapse) return note;

    const isExpanded = expandedLongNotes.has(noteId);
    if (isExpanded) return note;

    return lines.slice(0, maxLinesBeforeCollapse).join('\n') + '\n...';
  };

  const handleSaveNote = () => {
    if (newNote.trim()) {
      onSaveNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full border rounded p-2 text-sm bg-white text-black"
            rows={3}
            placeholder="Add a new note..."
            disabled={disabled}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveNote}
              disabled={disabled || !newNote.trim()}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>

      {notes.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-700 font-medium">History:</div>
          <div className="space-y-2">
            {notes
              .slice(0, expandedNotes.size > 0 ? undefined : initialNotesShown)
              .map((note) => {
                const noteId = `${note.id}-${note.createdAt}`;
                const lines = note.note.split('\n');
                const isLongNote = lines.length > maxLinesBeforeCollapse;

                return (
                  <div key={note.id} className="bg-gray-50 rounded p-2 text-sm">
                    <div className="text-gray-500 text-xs mb-1">
                      {new Date(note.createdAt).toLocaleString()} by {note.createdBy.firstName} {note.createdBy.lastName}
                    </div>
                    <div className="whitespace-pre-wrap">
                      {formatNote(note.note, noteId)}
                    </div>
                    {isLongNote && (
                      <button
                        onClick={() => toggleLongNoteExpansion(noteId)}
                        className="mt-1 text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center gap-1"
                      >
                        {expandedLongNotes.has(noteId) ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Show Less
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Show More ({lines.length - maxLinesBeforeCollapse} more lines)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              }).reverse()}
            {notes.length > initialNotesShown && (
              <NoteButton
                isExpanded={expandedNotes.size > 0}
                onClick={() => toggleNoteExpansion(notes[0].id)}
                count={notes.length - initialNotesShown}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}