import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStory, useUpdateStory, useTestsByTemplate, useUpdateTestResult, storiesService } from "../services/stories.service";
import type { Story, Template, Test } from "../services/types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type TestStatus = "not_tested" | "passed" | "failed";

interface TestNotes {
  id: number;
  note: string;
  createdAt: string;
  code?: string;
}

interface TestResult {
  id: number;
  status: TestStatus;
  notes: TestNotes[];
  test: {
    id: number;
    name: string;
    owner: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    };
    notes: string | null;
    categories: any[][];
    sections: any[];
    createdAt: string;
  };
}

interface CurrentNote {
  note: string;
  code?: string;
}

export default function RunStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { data: story, isLoading: isLoadingStory } = useStory(storyId || "");
  const updateTestResult = useUpdateTestResult();
  const [testStatuses, setTestStatuses] = useState<Record<number, TestStatus>>({});
  const [notes, setNotes] = useState<Record<number, CurrentNote>>({});
  const [uniqueTests, setUniqueTests] = useState<Test[]>([]);
  const [totalTests, setTotalTests] = useState(0);
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);
  const [dirtyNotes, setDirtyNotes] = useState<Set<number>>(new Set());
  const [newNote, setNewNote] = useState<Record<number, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [expandedLongNotes, setExpandedLongNotes] = useState<Set<string>>(new Set());

  const INITIAL_NOTES_SHOWN = 2;
  const MAX_LINES_BEFORE_COLLAPSE = 20;

  // Fetch tests for all templates and deduplicate them
  useEffect(() => {
    const fetchAllTests = async () => {
      if (!story?.templates) return;

      try {
        const testPromises = story.templates.map(template =>
          storiesService.getTestsByTemplate(template.id)
        );

        const testResults = await Promise.all(testPromises);
        const allTests = testResults.flat();
        setTotalTests(allTests.length);

        // Deduplicate tests by ID
        const uniqueTestsMap = new Map<number, Test>();
        allTests.forEach((test: Test) => {
          if (!uniqueTestsMap.has(test.id)) {
            uniqueTestsMap.set(test.id, test);
          }
        });

        setUniqueTests(Array.from(uniqueTestsMap.values()));
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    fetchAllTests();
  }, [story?.templates]);

  // Initialize test statuses from story test results
  useEffect(() => {
    if (story?.testResults) {
      const initialStatuses: Record<number, TestStatus> = {};
      const testResults = story.testResults as unknown as TestResult[];

      testResults.forEach((result) => {
        initialStatuses[result.test.id] = result.status;
      });

      setTestStatuses(initialStatuses);
    }
  }, [story]);

  const handleStatusChange = async (testId: number, status: TestStatus) => {
    if (!storyId) return;

    // Update local state
    const newTestStatuses = {
      ...testStatuses,
      [testId]: status
    };
    setTestStatuses(newTestStatuses);

    try {
      // Save to API
      await updateTestResult.mutateAsync({
        storyId,
        testId,
        data: {
          status,
          notes: notes[testId]?.note || null
        }
      });
    } catch (error) {
      console.error('Failed to update test status:', error);
    }
  };

  const handleNotesChange = (testId: number, value: string) => {
    setNewNote(prev => ({
      ...prev,
      [testId]: value
    }));
  };

  const handleSaveNotes = async (testId: number) => {
    if (!storyId || !newNote[testId]?.trim()) return;

    try {
      await updateTestResult.mutateAsync({
        storyId,
        testId,
        data: {
          status: testStatuses[testId] || "not_tested",
          notes: newNote[testId]
        }
      });

      // Clear the new note input after successful save
      setNewNote(prev => ({
        ...prev,
        [testId]: ''
      }));
      setDirtyNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const toggleTestExpansion = (testId: number) => {
    setExpandedTestId(expandedTestId === testId ? null : testId);
  };

  const toggleNoteExpansion = (testId: number) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
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
    if (lines.length <= MAX_LINES_BEFORE_COLLAPSE) return note;

    const isExpanded = expandedLongNotes.has(noteId);
    if (isExpanded) return note;

    return lines.slice(0, MAX_LINES_BEFORE_COLLAPSE).join('\n') + '\n...';
  };

  if (isLoadingStory) {
    return <div className="p-4">Loading story details...</div>;
  }

  if (!story) {
    return <div>Story not found</div>;
  }

  if (!story.templates || story.templates.length === 0) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Run Story: {story.name}</h2>
            <button
              onClick={() => navigate('/stories')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Stories
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">No templates found for this story. Please add templates before running tests.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Run Story: {story.name}</h2>
          <button
            onClick={() => navigate('/stories')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Stories
          </button>
        </div>

        {totalTests > uniqueTests.length && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {totalTests - uniqueTests.length} duplicate test{totalTests - uniqueTests.length === 1 ? '' : 's'} {totalTests - uniqueTests.length === 1 ? 'was' : 'were'} removed from the list.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {uniqueTests.map(test => (
            <div key={test.id} className="bg-white border rounded-lg shadow-sm">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{test.name}</h3>
                      <span className="text-sm text-gray-500">
                        {test.sections?.length || 0} sections
                      </span>
                      {test.categories && test.categories.length > 0 && (
                        <div className="flex gap-1">
                          {test.categories.map((category, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {typeof category === 'string' ? category : category.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(test.id, "not_tested")}
                      className={`px-3 py-1 rounded text-sm ${
                        testStatuses[test.id] === "not_tested"
                          ? "bg-gray-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Not Tested
                    </button>
                    <button
                      onClick={() => handleStatusChange(test.id, "passed")}
                      className={`px-3 py-1 rounded text-sm ${
                        testStatuses[test.id] === "passed"
                          ? "bg-green-500 text-white"
                          : "bg-green-200 text-green-700 hover:bg-green-300"
                      }`}
                    >
                      Passed
                    </button>
                    <button
                      onClick={() => handleStatusChange(test.id, "failed")}
                      className={`px-3 py-1 rounded text-sm ${
                        testStatuses[test.id] === "failed"
                          ? "bg-red-500 text-white"
                          : "bg-red-200 text-red-700 hover:bg-red-300"
                      }`}
                    >
                      Failed
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <textarea
                          value={newNote[test.id] || ""}
                          onChange={(e) => {
                            handleNotesChange(test.id, e.target.value);
                            setDirtyNotes(prev => new Set(prev).add(test.id));
                          }}
                          className="w-full border rounded p-2 text-sm bg-white text-black"
                          rows={3}
                          placeholder="Add a new note..."
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleSaveNotes(test.id)}
                            disabled={!newNote[test.id]?.trim()}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const testResult = story?.testResults?.find(r => r.test.id === test.id) as TestResult | undefined;
                      const notes = testResult?.notes || [];

                      return notes.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-700 font-medium">History:</div>
                          <div className="space-y-2">
                            {notes
                              .slice(0, expandedNotes.has(test.id) ? undefined : INITIAL_NOTES_SHOWN)
                              .map((historyItem) => {
                                const noteId = `${test.id}-${historyItem.id}-${historyItem.createdAt}`;
                                const lines = historyItem.note.split('\n');
                                const isLongNote = lines.length > MAX_LINES_BEFORE_COLLAPSE;

                                return (
                                  <div key={historyItem.id} className="bg-gray-50 rounded p-2 text-sm">
                                    <div className="text-gray-500 text-xs mb-1">
                                      {new Date(historyItem.createdAt).toLocaleString()}
                                    </div>
                                    <div className="whitespace-pre-wrap">
                                      {formatNote(historyItem.note, noteId)}
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
                                            Show More ({lines.length - MAX_LINES_BEFORE_COLLAPSE} more lines)
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                );
                              }).reverse()}
                            {notes.length > INITIAL_NOTES_SHOWN && (
                              <button
                                onClick={() => toggleNoteExpansion(test.id)}
                                className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                              >
                                {expandedNotes.has(test.id) ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    Show Less
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    Show More ({notes.length - INITIAL_NOTES_SHOWN} more)
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {notes[test.id]?.code !== undefined && (
                      <div className="relative">
                        <div className="text-sm text-gray-700 font-medium mb-1">Test Code:</div>
                        <textarea
                          value={notes[test.id]?.code || ""}
                          onChange={(e) => setNotes(prev => ({
                            ...prev,
                            [test.id]: { ...notes[test.id], code: e.target.value }
                          }))}
                          className="w-full border rounded p-2 text-sm font-mono bg-[#1E1E1E] text-white"
                          rows={6}
                          placeholder="Add test code here..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {expandedTestId === test.id && (
                  <div className="mt-3 space-y-2">
                    {test.sections?.map((section, index) => (
                      <div key={index} className="bg-gray-50 rounded p-2">
                        <h4 className="font-medium text-sm">{section.name}</h4>
                        {section.description && (
                          <p className="text-sm text-gray-600">{section.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}