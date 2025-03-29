import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
    const savedTests = localStorage.getItem('tests');
    if (savedTests) {
      setTemplates(JSON.parse(savedTests));
    }
  }, []);

  const handleSubmit = () => {
    if (!newTest.title || !newTest.templateId) return;

    const selectedTemplate = templates.find(t => t.id === newTest.templateId);
    if (!selectedTemplate) return;

    const test: StoryTest = {
      id: Date.now().toString(),
      title: newTest.title,
      template: selectedTemplate.template,
      templateId: selectedTemplate.id,
      status: 'not_tested'
    };

    // Get existing stories from localStorage
    const existingStories = JSON.parse(localStorage.getItem('stories') || '[]');

    // Update the stories array with the new test
    const updatedStories = existingStories.map((story: any) => {
      if (story.id === storyId) {
        return {
          ...story,
          tests: [...story.tests, test]
        };
      }
      return story;
    });

    // Save the updated stories back to localStorage
    localStorage.setItem('stories', JSON.stringify(updatedStories));

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
                autoComplete="off"
                data-form-type="other"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Template</label>
              <select
                value={newTest.templateId}
                onChange={(e) => {
                  const template = templates.find(t => t.id === e.target.value);
                  setNewTest(prev => ({
                    ...prev,
                    templateId: e.target.value,
                    template: template?.template || ''
                  }));
                }}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => navigate('/stories')}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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