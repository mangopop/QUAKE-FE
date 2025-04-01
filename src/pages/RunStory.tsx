import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStory, useUpdateStory, useTestsByTemplate, useUpdateTestResult, storiesService } from "../services/stories.service";
import type { Story, Template, Test } from "../services/types";

type TestStatus = "not_tested" | "passed" | "failed";

export default function RunStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { data: story, isLoading: isLoadingStory } = useStory(storyId || "");
  const updateTestResult = useUpdateTestResult();
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testStatuses, setTestStatuses] = useState<Record<number, TestStatus>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [uniqueTests, setUniqueTests] = useState<Test[]>([]);
  const [totalTests, setTotalTests] = useState(0);

  // Get all templates associated with this story
  const storyTemplates = story?.templates || [];

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

  // Get current template
  const currentTemplate = story?.templates[currentTemplateIndex];

  // Initialize test statuses from story test results
  useEffect(() => {
    if (story?.testResults) {
      const initialStatuses: Record<number, TestStatus> = {};
      const initialNotes: Record<number, string> = {};

      story.testResults.forEach(result => {
        initialStatuses[result.test.id] = result.status as TestStatus || "not_tested";
        if (result.notes) {
          initialNotes[result.test.id] = result.notes;
        }
      });

      setTestStatuses(initialStatuses);
      setNotes(initialNotes);
    }
  }, [story]);

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

  if (!currentTemplate || !uniqueTests.length) {
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
            <p className="text-gray-600">No tests found in the current template. Please add tests to the template before running.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentTest = uniqueTests[currentTestIndex];

  const handleStatusChange = async (status: TestStatus) => {
    if (!currentTest || !storyId) return;

    // Update local state
    const newTestStatuses = {
      ...testStatuses,
      [currentTest.id]: status
    };
    setTestStatuses(newTestStatuses);

    try {
      // Save to API using the new endpoint
      await updateTestResult.mutateAsync({
        storyId,
        testId: currentTest.id,
        data: {
          status,
          notes: notes[currentTest.id] || null
        }
      });
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

  const handlePrevious = () => {
    if (currentTestIndex > 0) {
      setCurrentTestIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentTestIndex < uniqueTests.length - 1) {
      setCurrentTestIndex(prev => prev + 1);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
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

      {/* Test Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevious}
          disabled={currentTestIndex === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Previous
        </button>
        <div className="text-center">
          <div className="font-medium text-lg">All Tests</div>
          <div className="text-sm text-gray-600">
            Test {currentTestIndex + 1} of {uniqueTests.length}
          </div>
        </div>
        <button
          onClick={handleNext}
          disabled={currentTestIndex === uniqueTests.length - 1}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Current Test */}
      <div className="border rounded p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">{currentTest.name}</h3>
        <p className="text-gray-600 mb-4">{currentTest.notes || 'No notes'}</p>

        {/* Test Status */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleStatusChange("not_tested")}
            className={`px-4 py-2 rounded ${
              testStatuses[currentTest.id] === "not_tested"
                ? "bg-gray-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Not Tested
          </button>
          <button
            onClick={() => handleStatusChange("passed")}
            className={`px-4 py-2 rounded ${
              testStatuses[currentTest.id] === "passed"
                ? "bg-green-500 text-white"
                : "bg-green-200 text-green-700 hover:bg-green-300"
            }`}
          >
            Passed
          </button>
          <button
            onClick={() => handleStatusChange("failed")}
            className={`px-4 py-2 rounded ${
              testStatuses[currentTest.id] === "failed"
                ? "bg-red-500 text-white"
                : "bg-red-200 text-red-700 hover:bg-red-300"
            }`}
          >
            Failed
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes[currentTest.id] || ""}
            onChange={(e) => handleNotesChange(e)}
            className="w-full border rounded p-2"
            rows={3}
            placeholder="Add notes about this test..."
          />
        </div>
      </div>
    </div>
  );
}