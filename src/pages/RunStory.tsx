import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStory, useUpdateStory, useTestsByTemplate, useUpdateTestResult } from "../services/stories.service";
import type { Story, Template } from "../services/types";

type TestStatus = "not_tested" | "passed" | "failed";

export default function RunStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { data: story, isLoading: isLoadingStory } = useStory(storyId || "");
  const updateStory = useUpdateStory();
  const updateTestResult = useUpdateTestResult();
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testStatuses, setTestStatuses] = useState<Record<number, TestStatus>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [allTests, setAllTests] = useState<any[]>([]);

  // Get all templates associated with this story
  const storyTemplates = story?.templates || [];

  // Fetch tests for the current template only
  const { data: currentTemplateTests = [], isLoading: isLoadingTests } = useTestsByTemplate(
    storyTemplates[currentTemplateIndex]?.id ?? 0
  );

  // Fetch tests for all templates when story changes
  useEffect(() => {
    const fetchAllTests = async () => {
      if (!storyTemplates.length) return;

      const testsPromises = storyTemplates.map(async (template) => {
        const response = await fetch(`/api/templates/${template.id}/tests`);
        const data = await response.json();
        return data;
      });

      const allTestsData = await Promise.all(testsPromises);
      const flattenedTests = allTestsData.flat();
      setAllTests(flattenedTests);
    };

    fetchAllTests();
  }, [storyTemplates]);

  useEffect(() => {
    if (story?.testResults) {
      const initialStatuses: Record<number, TestStatus> = {};
      const initialNotes: Record<number, string> = {};

      story.testResults.forEach(result => {
        initialStatuses[result.test.id] = result.passed ? "passed" : "failed";
        if (result.notes) {
          initialNotes[result.test.id] = result.notes;
        }
      });

      setTestStatuses(initialStatuses);
      setNotes(initialNotes);
    }
  }, [story]);

  if (isLoadingStory || isLoadingTests) {
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

  const currentTemplate = story.templates[currentTemplateIndex];

  if (!currentTemplateTests || currentTemplateTests.length === 0) {
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
            <p className="text-gray-600">No tests found in the template "{currentTemplate.name}". Please add tests to the template before running.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentTest = currentTemplateTests[currentTestIndex];

  const handleStatusChange = async (status: TestStatus) => {
    if (!currentTest || !storyId) return;

    console.log('Current test:', currentTest);
    console.log('Current test index:', currentTestIndex);
    console.log('Total tests in current template:', currentTemplateTests.length);
    console.log('Current template index:', currentTemplateIndex);
    console.log('Total templates:', story.templates.length);
    console.log('Current test statuses:', testStatuses);

    // Update local state
    const newTestStatuses = {
      ...testStatuses,
      [currentTest.id]: status
    };
    console.log('New test statuses:', newTestStatuses);
    setTestStatuses(newTestStatuses);

    try {
      // Save to API using the new endpoint
      await updateTestResult.mutateAsync({
        storyId,
        testId: currentTest.id,
        data: {
          passed: status === "passed",
          notes: notes[currentTest.id] || null
        }
      });

      // Move to next test if available
      if (currentTestIndex < currentTemplateTests.length - 1) {
        console.log('Moving to next test in current template');
        setCurrentTestIndex(prev => prev + 1);
      } else if (currentTemplateIndex < story.templates.length - 1) {
        console.log('Moving to first test of next template');
        setCurrentTemplateIndex(prev => prev + 1);
        setCurrentTestIndex(0);
      } else {
        console.log('No more tests to cycle through');
      }
    } catch (error) {
      console.error('Failed to update test status:', error);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentTest) return;
    setNotes(prev => ({
      ...prev,
      [currentTest.id]: e.target.value
    }));
  };

  const handleSave = async () => {
    if (!storyId) return;

    const testResults = Object.entries(testStatuses).map(([testId, status]) => {
      const test = allTests.find(t => t.id === parseInt(testId));

      if (!test) return null;

      return {
        id: parseInt(testId),
        passed: status === "passed",
        notes: notes[parseInt(testId)] || null,
        test: {
          id: test.id,
          name: test.name,
          owner: {
            id: 0,
            email: "",
            firstName: "",
            lastName: ""
          },
          notes: test.notes,
          categories: []
        }
      };
    }).filter((result): result is NonNullable<typeof result> => result !== null);

    try {
      await updateStory.mutateAsync({
        id: storyId,
        data: {
          testResults
        }
      });
      navigate('/stories');
    } catch (error) {
      console.error('Failed to update story:', error);
    }
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case "passed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "not_tested":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Run Story: {story.name}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Progress
            </button>
            <button
              onClick={() => navigate('/stories')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">Template:</span>
              <span className="font-medium">{currentTemplate.name}</span>
              <span className="text-sm text-gray-500">
                ({currentTemplateIndex + 1} of {story.templates.length})
              </span>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => {
                    if (currentTemplateIndex > 0) {
                      setCurrentTemplateIndex(prev => prev - 1);
                      setCurrentTestIndex(0);
                    }
                  }}
                  disabled={currentTemplateIndex === 0}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous Template
                </button>
                <button
                  onClick={() => {
                    if (currentTemplateIndex < story.templates.length - 1) {
                      setCurrentTemplateIndex(prev => prev + 1);
                      setCurrentTestIndex(0);
                    }
                  }}
                  disabled={currentTemplateIndex === story.templates.length - 1}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Template
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Test:</span>
              <span className="font-medium">{currentTest.name}</span>
              <span className="text-sm text-gray-500">
                ({currentTestIndex + 1} of {currentTemplateTests.length})
              </span>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => {
                    if (currentTestIndex > 0) {
                      setCurrentTestIndex(prev => prev - 1);
                    }
                  }}
                  disabled={currentTestIndex === 0}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous Test
                </button>
                <button
                  onClick={() => {
                    if (currentTestIndex < currentTemplateTests.length - 1) {
                      setCurrentTestIndex(prev => prev + 1);
                    }
                  }}
                  disabled={currentTestIndex === currentTemplateTests.length - 1}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Test
                </button>
              </div>
            </div>
          </div>

          {currentTest && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Test Description</h3>
                <div className="bg-gray-50 p-4 rounded">
                  {currentTest.notes || "No description available"}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Status</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleStatusChange("not_tested")}
                    className={`px-4 py-2 rounded text-white ${
                      testStatuses[currentTest.id] === "not_tested" ? "bg-gray-500" : "bg-gray-300"
                    } hover:bg-gray-600`}
                  >
                    Not Tested
                  </button>
                  <button
                    onClick={() => handleStatusChange("passed")}
                    className={`px-4 py-2 rounded text-white ${
                      testStatuses[currentTest.id] === "passed" ? "bg-green-500" : "bg-green-300"
                    } hover:bg-green-600`}
                  >
                    Passed
                  </button>
                  <button
                    onClick={() => handleStatusChange("failed")}
                    className={`px-4 py-2 rounded text-white ${
                      testStatuses[currentTest.id] === "failed" ? "bg-red-500" : "bg-red-300"
                    } hover:bg-red-600`}
                  >
                    Failed
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Notes</h3>
                <textarea
                  value={notes[currentTest.id] || ""}
                  onChange={handleNotesChange}
                  className="w-full border rounded p-2"
                  rows={4}
                  placeholder="Add any notes about this test..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}