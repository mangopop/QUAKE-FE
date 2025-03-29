import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Section {
  name: string;
  description: string;
  status: 'not_tested' | 'passed' | 'failed';
  notes: string;
}

interface TestTemplate {
  id: string;
  title: string;
  template: string;
  sections: {
    name: string;
    description: string;
  }[];
  createdAt: string;
}

interface Test {
  id: string;
  title: string;
  template: string;
  sections: Section[];
  status: 'not_tested' | 'passed' | 'failed';
}

interface Story {
  id: string;
  title: string;
  description: string;
  tests: Test[];
  createdAt: string;
}

export default function RunStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  // Load story and test templates from localStorage on component mount
  useEffect(() => {
    const savedStories = JSON.parse(localStorage.getItem('stories') || '[]');
    const savedTests = JSON.parse(localStorage.getItem('tests') || '[]');
    const foundStory = savedStories.find((s: Story) => s.id === storyId);

    if (foundStory) {
      console.log('Found story:', foundStory);
      console.log('Saved tests:', savedTests);

      // Merge test template data with story test data
      const storyWithTestData = {
        ...foundStory,
        tests: foundStory.tests.map((storyTest: Test) => {
          const template = savedTests.find((t: TestTemplate) => t.id === storyTest.id);
          console.log('Story test:', storyTest);
          console.log('Found template:', template);

          if (!template) {
            console.warn(`No template found for test ${storyTest.id}`);
            return {
              ...storyTest,
              sections: [],
              status: 'not_tested' as const
            };
          }

          return {
            ...storyTest,
            sections: template.sections.map((section: { name: string; description: string }) => ({
              ...section,
              status: 'not_tested' as const,
              notes: ''
            })),
            status: 'not_tested' as const
          };
        })
      };
      console.log('Story with test data:', storyWithTestData);
      setStory(storyWithTestData);
    } else {
      console.warn('No story found with ID:', storyId);
      navigate('/stories');
    }
  }, [storyId, navigate]);

  const updateSectionStatus = (testId: string, sectionIndex: number, status: 'not_tested' | 'passed' | 'failed') => {
    if (!story) return;

    const updatedStory = {
      ...story,
      tests: story.tests.map(test => {
        if (test.id === testId) {
          const updatedSections = test.sections.map((section, idx) =>
            idx === sectionIndex ? { ...section, status } : section
          );
          return {
            ...test,
            sections: updatedSections,
            status: getTestStatus(updatedSections)
          };
        }
        return test;
      })
    };

    setStory(updatedStory);
  };

  const updateSectionNotes = (testId: string, sectionIndex: number, notes: string) => {
    if (!story) return;

    const updatedStory = {
      ...story,
      tests: story.tests.map(test => {
        if (test.id === testId) {
          const updatedSections = test.sections.map((section, idx) =>
            idx === sectionIndex ? { ...section, notes } : section
          );
          return {
            ...test,
            sections: updatedSections
          };
        }
        return test;
      })
    };

    setStory(updatedStory);
  };

  const getTestStatus = (sections: Section[]): Test['status'] => {
    if (!sections || sections.length === 0) return 'not_tested';
    if (sections.some(s => s.status === 'failed')) return 'failed';
    if (sections.every(s => s.status === 'passed')) return 'passed';
    return 'not_tested';
  };

  const getStatusColor = (status: Test['status']) => {
    switch (status) {
      case 'passed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: Test['status']) => {
    switch (status) {
      case 'passed':
        return '✓';
      case 'failed':
        return '✗';
      default:
        return '?';
    }
  };

  const handleSave = () => {
    if (!story) return;

    // Get existing stories from localStorage
    const existingStories = JSON.parse(localStorage.getItem('stories') || '[]');

    // Update the stories array with the updated story
    const updatedStories = existingStories.map((s: Story) => {
      if (s.id === story.id) {
        return story;
      }
      return s;
    });

    // Save the updated stories back to localStorage
    localStorage.setItem('stories', JSON.stringify(updatedStories));

    // Navigate back to the stories page
    navigate('/stories');
  };

  if (!story) {
    return <div className="p-4">Loading...</div>;
  }

  const currentTest = story.tests[currentTestIndex];
  if (!currentTest) {
    return <div className="p-4">No test found</div>;
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Running Story: {story.title}</h2>
            <p className="text-gray-600">{story.description}</p>
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Progress
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Test {currentTestIndex + 1} of {story.tests.length}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentTestIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentTestIndex === 0}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentTestIndex(prev => Math.min(story.tests.length - 1, prev + 1))}
                  disabled={currentTestIndex === story.tests.length - 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h4 className="text-lg font-semibold">{currentTest.title}</h4>
              <p className="text-gray-600">Template: {currentTest.template}</p>
              <span className={`${getStatusColor(currentTest.status)}`}>
                {getStatusIcon(currentTest.status)} {currentTest.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-4">
              {currentTest.sections && currentTest.sections.length > 0 ? (
                currentTest.sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{section.name}</span>
                      <span className={`${getStatusColor(section.status)}`}>
                        {getStatusIcon(section.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{section.description}</p>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSectionStatus(currentTest.id, index, 'passed')}
                          className={`px-3 py-1 rounded ${
                            section.status === 'passed'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => updateSectionStatus(currentTest.id, index, 'failed')}
                          className={`px-3 py-1 rounded ${
                            section.status === 'failed'
                              ? 'bg-red-500 text-white'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          Fail
                        </button>
                      </div>
                      <textarea
                        value={section.notes}
                        onChange={(e) => updateSectionNotes(currentTest.id, index, e.target.value)}
                        placeholder="Add notes about this section..."
                        className="w-full border rounded p-2 text-sm"
                        rows={3}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No sections found for this test
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}