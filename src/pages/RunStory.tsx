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

  // Get all templates associated with this story
  const storyTemplates = story?.templates || [];

  // Fetch tests for the current template only
  const { data: currentTemplateTests = [], isLoading: isLoadingTests } = useTestsByTemplate(
    storyTemplates[currentTemplateIndex]?.id ?? 0
  );

  // Get current template
  const currentTemplate = story?.templates[currentTemplateIndex];

  // Initialize test statuses from story test results
  useEffect(() => {
    if (story?.testResults) {
      const initialStatuses: Record<number, TestStatus> = {};
      const initialNotes: Record<number, string> = {};

      story.testResults.forEach(result => {
        // Use the status directly from the test result
        initialStatuses[result.test.id] = result.status as TestStatus || "not_tested";
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

  if (!currentTemplate || !currentTemplateTests.length) {
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
          status,
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
      const test = currentTemplateTests.find(t => t.id === parseInt(testId));

      if (!test) return null;

      return {
        id: parseInt(testId),
        status,
        notes: notes[parseInt(testId)] || null,
        test: {
          id: test.id,
          name: test.name,
          owner: test.owner,
          notes: test.notes,
          categories: test.categories
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

  const handlePrevious = () => {
    if (currentTestIndex > 0) {
      setCurrentTestIndex(prev => prev - 1);
    } else if (currentTemplateIndex > 0) {
      setCurrentTemplateIndex(prev => prev - 1);
      setCurrentTestIndex(0);
    }
  };

  const handleNext = () => {
    if (currentTestIndex < currentTemplateTests.length - 1) {
      setCurrentTestIndex(prev => prev + 1);
    } else if (currentTemplateIndex < story.templates.length - 1) {
      setCurrentTemplateIndex(prev => prev + 1);
      setCurrentTestIndex(0);
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

      {/* Test Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevious}
          disabled={currentTemplateIndex === 0 && currentTestIndex === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Previous
        </button>
        <div className="text-center">
          <div className="font-medium text-lg">{currentTemplate.name}</div>
          <div className="text-sm text-gray-600">
            Template {currentTemplateIndex + 1} of {story.templates.length} - Test {currentTestIndex + 1} of {currentTemplateTests.length}
          </div>
        </div>
        <button
          onClick={handleNext}
          disabled={currentTemplateIndex === story.templates.length - 1 && currentTestIndex === currentTemplateTests.length - 1}
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