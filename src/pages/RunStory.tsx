import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useStory,
  useUpdateTestResult,
  useUpdateSectionResult,
  useSectionResults,
  useAddSectionNote,
  useCompleteStory,
  useMarkStoryFailed,
  useStoryHistory,
  storiesService
} from "../services/stories.service";
import type { Test, SectionResult, Section, StoryHistoryResponse } from "../services/types";
import { useQueryClient } from "@tanstack/react-query";
import BackButton from '../components/common/BackButton';
import TestCard from '../components/common/TestCard';
import StatusHeader from '../components/common/StatusHeader';

type TestStatus = "not_tested" | "passed" | "failed";

interface TestNotes {
  id: number;
  note: string;
  createdAt: string;
  createdBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface TestResult {
  id: number;
  status: TestStatus;
  notes: TestNotes[];
  sectionResults: SectionResult[];
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
    sections: Section[];
    createdAt: string;
  };
}

export default function RunStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const { data: story, isLoading: isLoadingStory } = useStory(storyId || "");
  const { data: storyHistory } = useStoryHistory(storyId || "") as { data: StoryHistoryResponse | undefined };
  const updateTestResult = useUpdateTestResult();
  const updateSectionResult = useUpdateSectionResult();
  const completeStory = useCompleteStory();
  const markStoryFailed = useMarkStoryFailed();
  const { data: sectionResultsData } = useSectionResults(storyId || "");
  const addSectionNote = useAddSectionNote();
  const [testStatuses, setTestStatuses] = useState<Record<number, TestStatus>>({});
  const [uniqueTests, setUniqueTests] = useState<Test[]>([]);
  const [totalTests, setTotalTests] = useState(0);
  const [sectionResults, setSectionResults] = useState<Record<number, SectionResult>>({});
  const [completionNotes, setCompletionNotes] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureNotes, setFailureNotes] = useState("");
  const [failureReasons, setFailureReasons] = useState<{ testId: number; testName: string; sectionId?: number; sectionName?: string; reason: string }[]>([]);
  const queryClient = useQueryClient();

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

      // First, set all tests to "not_tested"
      uniqueTests.forEach(test => {
        initialStatuses[test.id] = "not_tested";
      });

      // Then update with any existing test results
      testResults.forEach((result) => {
        initialStatuses[result.test.id] = result.status;
      });

      setTestStatuses(initialStatuses);
    } else {
      // If no test results, set all tests to "not_tested"
      const initialStatuses: Record<number, TestStatus> = {};
      uniqueTests.forEach(test => {
        initialStatuses[test.id] = "not_tested";
      });
      setTestStatuses(initialStatuses);
    }
  }, [story, uniqueTests]);

  // Initialize section results from API
  useEffect(() => {
    if (sectionResultsData?.section_results) {
      const initialSectionResults: Record<number, SectionResult> = {};
      sectionResultsData.section_results.forEach((result) => {
        initialSectionResults[result.section.id] = result;
      });
      setSectionResults(initialSectionResults);
    } else {
      // If no section results, initialize all sections as "not_tested"
      const initialSectionResults: Record<number, SectionResult> = {};
      uniqueTests.forEach(test => {
        test.sections.forEach(section => {
          initialSectionResults[section.id] = {
            id: 0,
            status: "not_tested",
            section: {
              id: section.id,
              name: section.name,
              description: section.description
            },
            updatedAt: new Date().toISOString(),
            notes: []
          };
        });
      });
      setSectionResults(initialSectionResults);
    }
  }, [sectionResultsData, uniqueTests]);

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
          notes: null
        }
      });
    } catch (error) {
      console.error('Failed to update test status:', error);
    }
  };

  const handleSectionStatusChange = async (testId: number, sectionId: number, status: "not_tested" | "passed" | "failed") => {
    if (!storyId) return;

    try {
      const updatedResult = await updateSectionResult.mutateAsync({
        storyId,
        sectionId,
        data: { status }
      });

      // Update local state with the new result
      setSectionResults(prev => ({
        ...prev,
        [sectionId]: updatedResult
      }));

      // The backend will handle updating the test status based on section results
      // We can refetch the story data to get the updated test status
      await queryClient.invalidateQueries({ queryKey: ['story', storyId] });
    } catch (error) {
      console.error('Failed to update section status:', error);
    }
  };

  const handleSaveNotes = async (testId: number, note: string) => {
    if (!storyId || !note.trim()) return;

    try {
      await updateTestResult.mutateAsync({
        storyId,
        testId,
        data: {
          status: testStatuses[testId] || "not_tested",
          notes: note
        }
      });
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleSaveSectionNotes = async (testId: number, sectionId: number, note: string) => {
    if (!storyId || !note.trim()) return;

    try {
      await addSectionNote.mutateAsync({
        storyId,
        sectionId,
        data: { note }
      });
    } catch (error) {
      console.error('Failed to save section notes:', error);
    }
  };

  const handleCompleteStory = async () => {
    if (!storyId) return;

    try {
      await completeStory.mutateAsync({
        storyId,
        data: { notes: completionNotes }
      });
      setShowCompletionModal(false);
      setCompletionNotes("");
    } catch (error) {
      console.error('Failed to complete story:', error);
    }
  };

  const handleMarkStoryFailed = async () => {
    if (!storyId) return;

    try {
      await markStoryFailed.mutateAsync({
        storyId,
        data: {
          notes: failureNotes,
          failureReasons
        }
      });
      setShowFailureModal(false);
      setFailureNotes("");
      setFailureReasons([]);
    } catch (error) {
      console.error('Failed to mark story as failed:', error);
    }
  };

  const addFailureReason = () => {
    setFailureReasons([...failureReasons, { testId: 0, testName: "", reason: "" }]);
  };

  const updateFailureReason = (index: number, field: string, value: string | number | undefined) => {
    const newReasons = [...failureReasons];
    newReasons[index] = {
      ...newReasons[index],
      [field]: value
    };
    setFailureReasons(newReasons);
  };

  const removeFailureReason = (index: number) => {
    setFailureReasons(failureReasons.filter((_, i) => i !== index));
  };

  const canCompleteStory = () => {
    if (!story?.testResults) return false;
    return story.testResults.every(result => result.status === "passed");
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
            <BackButton />
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
        <StatusHeader
          title={`Run Story: ${story.name}`}
          totalTests={totalTests}
          uniqueTests={uniqueTests.length}
        />

        {!story?.isCompleted && (
          <div className="flex justify-end space-x-2 mb-6">
            <button
              onClick={() => setShowFailureModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Mark as Failed
            </button>
            {canCompleteStory() && (
              <button
                onClick={() => setShowCompletionModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Complete Story
              </button>
            )}
          </div>
        )}

        {story?.isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-800 font-medium">Story Completed</h3>
                <p className="text-green-600 text-sm">
                  Completed by {story.completedBy?.firstName} {story.completedBy?.lastName} on {new Date(story.completedAt || "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {storyHistory && storyHistory.history.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Test History</h3>
            <div className="space-y-2">
              {storyHistory.history.map((entry: {
                timestamp: string;
                status: string;
                created_by: {
                  id: number;
                  firstName: string;
                };
                tests: {
                  id: number;
                  name: string;
                  status: string;
                  notes: string[];
                  sections: {
                    id: number;
                    name: string;
                    status: string;
                  }[];
                  section_notes: string[];
                }[];
              }, index: number) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div
                    className={`p-3 cursor-pointer flex justify-between items-center ${
                      entry.status === "2" ? "bg-green-50" : "bg-red-50"
                    }`}
                    onClick={() => {
                      const details = document.getElementById(`history-details-${index}`);
                      if (details) {
                        details.classList.toggle('hidden');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        entry.status === "2" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {entry.status === "2" ? "Passed" : "Failed"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        by {entry.created_by.firstName}
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  <div id={`history-details-${index}`} className="hidden">
                    <div className="p-3 border-t bg-white">
                      <div className="space-y-3">
                        {entry.tests.map((test) => (
                          <div key={test.id} className="border rounded p-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{test.name}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                test.status === "passed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {test.status === "passed" ? "Passed" : "Failed"}
                              </span>
                            </div>

                            {test.notes.length > 0 && (
                              <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Test Notes</h4>
                                <div className="space-y-2">
                                  {test.notes.map((note, noteIndex) => {
                                    const match = note.match(/\[(.*?)\] (.*?): (.*)/);
                                    if (match) {
                                      const [, timestamp, user, content] = match;
                                      return (
                                        <div key={noteIndex} className="text-xs bg-white rounded p-1.5 border">
                                          <div className="flex items-center text-gray-500 mb-0.5">
                                            <span>{timestamp}</span>
                                            <span className="mx-1">•</span>
                                            <span className="font-medium">{user}</span>
                                          </div>
                                          <div className="text-gray-700">{content}</div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Sections</h4>
                              <div className="space-y-3">
                                {test.sections.map((section) => (
                                  <div key={section.id} className="bg-gray-50 rounded p-2">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-medium">{section.name}</span>
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        section.status === "passed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                      }`}>
                                        {section.status}
                                      </span>
                                    </div>

                                    {test.section_notes.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {test.section_notes
                                          .filter(note => note.includes(`[Section: ${section.name}]`))
                                          .map((note, noteIndex) => {
                                            const match = note.match(/\[Section: (.*?)\] \[(.*?)\] (.*?): (.*)/);
                                            if (match) {
                                              const [, , timestamp, user, content] = match;
                                              return (
                                                <div key={noteIndex} className="text-xs bg-white rounded p-1.5 border">
                                                  <div className="flex items-center text-gray-500 mb-0.5">
                                                    <span>{timestamp}</span>
                                                    <span className="mx-1">•</span>
                                                    <span className="font-medium">{user}</span>
                                                  </div>
                                                  <div className="text-gray-700">{content}</div>
                                                </div>
                                              );
                                            }
                                            return null;
                                          })}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {uniqueTests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              status={testStatuses[test.id]}
              onStatusChange={(status) => handleStatusChange(test.id, status)}
              onSaveNote={(note) => handleSaveNotes(test.id, note)}
              sectionResults={sectionResults}
              onSectionStatusChange={handleSectionStatusChange}
              onSaveSectionNote={handleSaveSectionNotes}
              notes={(() => {
                const testResult = story?.testResults?.find(r => r.test.id === test.id) as TestResult | undefined;
                return testResult?.notes || [];
              })()}
              initialNotesShown={INITIAL_NOTES_SHOWN}
              maxLinesBeforeCollapse={MAX_LINES_BEFORE_COLLAPSE}
              disabled={story?.isCompleted}
            />
          ))}
        </div>

        {showFailureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
              <h3 className="text-lg font-medium mb-4">Mark Story as Failed</h3>
              <p className="text-gray-600 mb-4">
                Please provide details about why the story failed.
              </p>
              <textarea
                value={failureNotes}
                onChange={(e) => setFailureNotes(e.target.value)}
                placeholder="Add failure notes..."
                className="w-full p-2 border rounded mb-4"
                rows={4}
              />

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Failure Reasons</h4>
                  <button
                    onClick={addFailureReason}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    + Add Reason
                  </button>
                </div>
                <div className="space-y-2">
                  {failureReasons.map((reason, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="flex-1 space-y-2">
                        <select
                          value={reason.testId}
                          onChange={(e) => updateFailureReason(index, "testId", parseInt(e.target.value))}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select Test</option>
                          {uniqueTests.map((test) => (
                            <option key={test.id} value={test.id}>
                              {test.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={reason.sectionId || ""}
                          onChange={(e) => updateFailureReason(index, "sectionId", e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select Section (Optional)</option>
                          {uniqueTests
                            .find((test) => test.id === reason.testId)
                            ?.sections.map((section) => (
                              <option key={section.id} value={section.id}>
                                {section.name}
                              </option>
                            ))}
                        </select>
                        <input
                          type="text"
                          value={reason.reason}
                          onChange={(e) => updateFailureReason(index, "reason", e.target.value)}
                          placeholder="Failure reason..."
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <button
                        onClick={() => removeFailureReason(index)}
                        className="text-red-500 hover:text-red-600 p-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowFailureModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkStoryFailed}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  disabled={failureReasons.length === 0 || !failureNotes.trim()}
                >
                  Mark as Failed
                </button>
              </div>
            </div>
          </div>
        )}

        {showCompletionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Complete Story</h3>
              <p className="text-gray-600 mb-4">
                All tests have passed. Please add any final notes before completing the story.
              </p>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add completion notes..."
                className="w-full p-2 border rounded mb-4"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteStory}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Complete Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}