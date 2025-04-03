import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStory, useUpdateStory, useTestsByTemplate, useUpdateTestResult, storiesService } from "../services/stories.service";
import type { Story, Template, Test } from "../services/types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type TestStatus = "not_tested" | "passed" | "failed";

interface TestNotes {
  notes: string;
  code?: string;
}

export default function RunStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { data: story, isLoading: isLoadingStory } = useStory(storyId || "");
  const updateTestResult = useUpdateTestResult();
  const [testStatuses, setTestStatuses] = useState<Record<number, TestStatus>>({});
  const [notes, setNotes] = useState<Record<number, TestNotes>>({});
  const [uniqueTests, setUniqueTests] = useState<Test[]>([]);
  const [totalTests, setTotalTests] = useState(0);
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);
  const [dirtyNotes, setDirtyNotes] = useState<Set<number>>(new Set());

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
      const initialNotes: Record<number, TestNotes> = {};

      story.testResults.forEach(result => {
        initialStatuses[result.test.id] = result.status as TestStatus || "not_tested";
        if (result.notes) {
          initialNotes[result.test.id] = { notes: result.notes };
        }
      });

      setTestStatuses(initialStatuses);
      setNotes(initialNotes);
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
          notes: notes[testId]?.notes || null
        }
      });
    } catch (error) {
      console.error('Failed to update test status:', error);
    }
  };

  const handleNotesChange = (testId: number, value: TestNotes) => {
    setNotes(prev => ({
      ...prev,
      [testId]: value
    }));
    setDirtyNotes(prev => new Set(prev).add(testId));
  };

  const handleSaveNotes = async (testId: number) => {
    if (!storyId) return;

    try {
      await updateTestResult.mutateAsync({
        storyId,
        testId,
        data: {
          status: testStatuses[testId] || "not_tested",
          notes: notes[testId]?.notes || null
        }
      });
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
                      <textarea
                        value={notes[test.id]?.notes || ""}
                        onChange={(e) => handleNotesChange(test.id, { ...notes[test.id], notes: e.target.value })}
                        className="flex-1 border rounded p-2 text-sm bg-white text-black"
                        rows={3}
                        placeholder="Add notes about this test..."
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            const currentNotes = notes[test.id] || { notes: '' };
                            if (notes[test.id]?.code !== undefined) {
                              // If there's code, remove it completely
                              const { code, ...restNotes } = notes[test.id];
                              handleNotesChange(test.id, restNotes);
                            } else {
                              // If no code, add empty code field
                              handleNotesChange(test.id, { ...currentNotes, code: '' });
                            }
                          }}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 flex items-center gap-1 h-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          {notes[test.id]?.code !== undefined ? 'Remove Code' : 'Add Code'}
                        </button>
                        {dirtyNotes.has(test.id) && (
                          <button
                            onClick={() => handleSaveNotes(test.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 h-full"
                          >
                            Save Notes
                          </button>
                        )}
                      </div>
                    </div>
                    {notes[test.id]?.code !== undefined && (
                      <div className="relative">
                        <div className="text-sm text-gray-700 font-medium mb-1">Error Code:</div>
                        <textarea
                          value={notes[test.id]?.code || ""}
                          onChange={(e) => handleNotesChange(test.id, { ...notes[test.id], code: e.target.value })}
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