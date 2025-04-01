import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStory, useSaveTestResult, useTestsByTemplate } from "../services/stories.service";
import type { Story, Test } from "../services/types";

interface TestWithTemplate extends Test {
  templateName: string;
}

export default function RunStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { data: story, isLoading: isLoadingStory } = useStory(storyId || "");
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const saveTestResult = useSaveTestResult();

  // Get all templates associated with this story
  const storyTemplates = story?.templates || [];

  // Fetch tests for each template
  const templateTestsQueries = storyTemplates.map(template =>
    useTestsByTemplate(template.id)
  );

  // Debug logging
  useEffect(() => {
    console.log('Story data:', story);
    console.log('Story templates:', storyTemplates);
    templateTestsQueries.forEach((query, index) => {
      console.log(`Tests for template ${storyTemplates[index]?.id}:`, query.data);
    });
  }, [story, storyTemplates, templateTestsQueries]);

  if (isLoadingStory || templateTestsQueries.some(q => q.isLoading)) {
    return <div className="p-4">Loading story details...</div>;
  }

  if (!story) {
    return <div className="p-4">Story not found</div>;
  }

  // Get all tests from all templates that are associated with this story
  const allTests = storyTemplates.flatMap((template, index) => {
    const tests = templateTestsQueries[index].data;
    if (!tests || !Array.isArray(tests)) {
      console.warn(`No tests found for template ${template.id}`);
      return [];
    }
    return tests.map(test => ({
      ...test,
      templateName: template.name,
      sections: test.sections || []
    }));
  }) as TestWithTemplate[];

  console.log('All tests found:', allTests);

  if (allTests.length === 0) {
    return <div className="p-4">No tests found for this story</div>;
  }

  const currentTest = allTests[currentTestIndex];

  const handleTestStatusChange = async (testId: number, status: 'passed' | 'failed') => {
    if (!storyId) return;

    try {
      await saveTestResult.mutateAsync({
        storyId,
        data: {
          testId,
          passed: status === 'passed',
          notes: getTestNotes(testId)
        }
      });
    } catch (error) {
      console.error('Failed to save test result:', error);
    }
  };

  const handleTestNotesChange = async (testId: number, notes: string) => {
    if (!storyId) return;

    const currentResult = getTestResult(testId);
    if (currentResult) {
      try {
        await saveTestResult.mutateAsync({
          storyId,
          data: {
            testId,
            passed: currentResult.passed,
            notes
          }
        });
      } catch (error) {
        console.error('Failed to save test notes:', error);
      }
    }
  };

  const getTestResult = (testId: number) => {
    return story.testResults?.find(r => r.test.id === testId);
  };

  const getTestStatus = (testId: number) => {
    const result = getTestResult(testId);
    if (!result) return 'not_tested';
    return result.passed ? 'passed' : 'failed';
  };

  const getTestNotes = (testId: number) => {
    return getTestResult(testId)?.notes || '';
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{story.name}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/stories')}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Back to Stories
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">{currentTest.name}</h3>
              <p className="text-sm text-gray-600">Test {currentTestIndex + 1} of {allTests.length}</p>
              <p className="text-sm text-gray-500">From template: {currentTest.templateName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentTestIndex(prev => Math.max(0, prev - 1))}
                disabled={currentTestIndex === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentTestIndex(prev => Math.min(allTests.length - 1, prev + 1))}
                disabled={currentTestIndex === allTests.length - 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleTestStatusChange(currentTest.id, 'passed')}
                disabled={saveTestResult.isPending}
                className={`px-4 py-2 rounded ${
                  getTestStatus(currentTest.id) === 'passed'
                    ? 'bg-green-500 text-white'
                    : 'border border-green-500 text-green-500 hover:bg-green-50'
                } disabled:opacity-50`}
              >
                Pass
              </button>
              <button
                onClick={() => handleTestStatusChange(currentTest.id, 'failed')}
                disabled={saveTestResult.isPending}
                className={`px-4 py-2 rounded ${
                  getTestStatus(currentTest.id) === 'failed'
                    ? 'bg-red-500 text-white'
                    : 'border border-red-500 text-red-500 hover:bg-red-50'
                } disabled:opacity-50`}
              >
                Fail
              </button>
            </div>

            <div className="space-y-2">
              {currentTest.sections.map((section, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium">{section.name}</h5>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="w-full border rounded p-2"
                placeholder="Add notes..."
                rows={3}
                value={getTestNotes(currentTest.id)}
                onChange={(e) => handleTestNotesChange(currentTest.id, e.target.value)}
                disabled={saveTestResult.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}