import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { StoryFolder, Story, Test } from "../types/story";

interface TestTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: {
    name: string;
    description: string;
  }[];
}

// Function to find a story in the folder tree
const findStoryInFolder = (folder: StoryFolder, targetStoryId: string): Story | null => {
  // Check stories in current folder
  const storyInCurrentFolder = folder.stories.find(s => s.id === targetStoryId);
  if (storyInCurrentFolder) {
    return storyInCurrentFolder;
  }

  // Check subfolders
  for (const subfolder of folder.subfolders) {
    const foundStory = findStoryInFolder(subfolder, targetStoryId);
    if (foundStory) {
      return foundStory;
    }
  }

  return null;
};

export default function RunStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  // Load story and test templates from localStorage on component mount
  useEffect(() => {
    const savedStories = localStorage.getItem('stories');
    const savedTemplates = localStorage.getItem('templates');

    if (!savedStories || !storyId || !savedTemplates) return;

    const rootFolder: StoryFolder = JSON.parse(savedStories);
    const templates: TestTemplate[] = JSON.parse(savedTemplates);
    const foundStory = findStoryInFolder(rootFolder, storyId);

    if (foundStory) {
      console.log('Found story:', foundStory);
      console.log('Saved templates:', templates);

      // Merge test template data with story test data
      const storyWithTestData = {
        ...foundStory,
        tests: foundStory.tests.map((test: Test) => {
          const template = templates.find(t => t.id === test.templateId);
          console.log('Story test:', test);
          console.log('Found template:', template);

          if (!template) {
            console.warn(`No template found for test ${test.templateId}`);
            return {
              ...test,
              sections: [],
              status: 'not_tested' as const
            };
          }

          // If the test already has sections with statuses, keep them
          if (test.sections && test.sections.length > 0) {
            return test;
          }

          // Otherwise, create new sections from the template
          return {
            ...test,
            sections: template.sections.map(section => ({
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

      // Set initial test index from URL if provided
      const testIndex = searchParams.get('testIndex');
      if (testIndex !== null) {
        const index = parseInt(testIndex, 10);
        if (!isNaN(index) && index >= 0 && index < storyWithTestData.tests.length) {
          setCurrentTestIndex(index);
        }
      }
    } else {
      console.error('Story not found:', storyId);
      navigate('/stories');
    }
  }, [storyId, searchParams, navigate]);

  const updateSectionStatus = (testId: string, sectionIndex: number, status: 'not_tested' | 'passed' | 'failed') => {
    if (!story) return;

    setStory({
      ...story,
      tests: story.tests.map((test: Test) => {
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
    });
  };

  const updateSectionNotes = (testId: string, sectionIndex: number, notes: string) => {
    if (!story) return;

    setStory({
      ...story,
      tests: story.tests.map((test: Test) => {
        if (test.id === testId) {
          return {
            ...test,
            sections: test.sections.map((section, idx) =>
              idx === sectionIndex ? { ...section, notes } : section
            )
          };
        }
        return test;
      })
    });
  };

  const getTestStatus = (sections: Test['sections']): Test['status'] => {
    if (sections.length === 0) return 'not_tested';
    if (sections.every(s => s.status === 'passed')) return 'passed';
    if (sections.some(s => s.status === 'failed')) return 'failed';
    return 'not_tested';
  };

  const getStatusColor = (status: Test['status']) => {
    switch (status) {
      case 'passed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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

    // Get the root folder from localStorage
    const savedStories = localStorage.getItem('stories');
    if (!savedStories) return;

    const rootFolder: StoryFolder = JSON.parse(savedStories);

    // Function to update story in folder
    const updateStoryInFolder = (folder: StoryFolder, updatedStory: Story): StoryFolder => {
      // Check if this folder contains the target story
      const storyIndex = folder.stories.findIndex(s => s.id === updatedStory.id);
      if (storyIndex !== -1) {
        return {
          ...folder,
          stories: folder.stories.map((s, index) =>
            index === storyIndex ? updatedStory : s
          )
        };
      }

      // If not found in this folder, check subfolders
      return {
        ...folder,
        subfolders: folder.subfolders.map(subfolder =>
          updateStoryInFolder(subfolder, updatedStory)
        )
      };
    };

    // Update the story in the folder structure
    const updatedRootFolder = updateStoryInFolder(rootFolder, story);

    // Save the updated folder structure back to localStorage
    localStorage.setItem('stories', JSON.stringify(updatedRootFolder));

    // Navigate back to the stories page
    navigate('/stories');
  };

  if (!story) {
    return <div>Loading...</div>;
  }

  const currentTest = story.tests[currentTestIndex];

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{story.title}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate('/stories')}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Test Navigation</h3>
            <div className="flex gap-2 border-b">
              {story.tests.map((test, index) => (
                <button
                  key={test.id}
                  onClick={() => setCurrentTestIndex(index)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    index === currentTestIndex
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {test.title}
                </button>
              ))}
            </div>
          </div>

          {currentTest && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">{currentTest.title}</h3>
                  <p className="text-sm text-gray-600">Test {currentTestIndex + 1} of {story.tests.length}</p>
                </div>
                <div className="flex items-center gap-4">
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
                  <span className={`${getStatusColor(currentTest.status)}`}>
                    {getStatusIcon(currentTest.status)} {currentTest.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {currentTest.sections.map((section, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{section.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSectionStatus(currentTest.id, index, 'passed')}
                          className={`px-2 py-1 rounded ${
                            section.status === 'passed'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => updateSectionStatus(currentTest.id, index, 'failed')}
                          className={`px-2 py-1 rounded ${
                            section.status === 'failed'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          Fail
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{section.description}</p>
                    <textarea
                      value={section.notes}
                      onChange={(e) => updateSectionNotes(currentTest.id, index, e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="Add notes..."
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}