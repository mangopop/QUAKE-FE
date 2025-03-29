import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StoryFolder, Test } from "../types/story";

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

interface StoryTest {
  id: string;
  title: string;
  template: string;
  templateId: string;
  status: 'not_tested' | 'passed' | 'failed';
}

export default function AddTestToStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [newTest, setNewTest] = useState<Partial<StoryTest>>({
    title: "",
    template: "",
    templateId: "",
    status: 'not_tested'
  });

  // Load templates from localStorage on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  const addTestToFolder = (folder: StoryFolder, targetStoryId: string, test: Test): StoryFolder => {
    // Check if this folder contains the target story
    const storyIndex = folder.stories.findIndex(story => story.id === targetStoryId);
    if (storyIndex !== -1) {
      return {
        ...folder,
        stories: folder.stories.map((story, index) =>
          index === storyIndex
            ? { ...story, tests: [...story.tests, test] }
            : story
        )
      };
    }

    // If not found in this folder, check subfolders
    return {
      ...folder,
      subfolders: folder.subfolders.map(subfolder =>
        addTestToFolder(subfolder, targetStoryId, test)
      )
    };
  };

  const handleSubmit = () => {
    if (!newTest.title || !newTest.templateId || !storyId) return;

    const selectedTemplate = templates.find(t => t.id === newTest.templateId);
    if (!selectedTemplate) return;

    const test: Test = {
      id: Date.now().toString(),
      title: newTest.title,
      template: selectedTemplate.name,
      templateId: selectedTemplate.id,
      sections: selectedTemplate.sections.map(section => ({
        ...section,
        status: 'not_tested' as const,
        notes: ''
      })),
      status: 'not_tested'
    };

    // Get the root folder from localStorage
    const savedStories = localStorage.getItem('stories');
    if (!savedStories) return;

    const rootFolder: StoryFolder = JSON.parse(savedStories);

    // Update the folder structure with the new test
    const updatedRootFolder = addTestToFolder(rootFolder, storyId, test);

    // Save the updated folder structure back to localStorage
    localStorage.setItem('stories', JSON.stringify(updatedRootFolder));

    // Navigate back to the stories page
    navigate('/stories');
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add Test to Story</h2>
          <button
            onClick={() => navigate('/stories')}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Test Title</label>
              <input
                type="text"
                value={newTest.title}
                onChange={(e) => setNewTest(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                placeholder="Enter test title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Test Template</label>
              <select
                value={newTest.templateId}
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value);
                  setNewTest(prev => ({
                    ...prev,
                    templateId: e.target.value,
                    template: template?.name || ""
                  }));
                }}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}