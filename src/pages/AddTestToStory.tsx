import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Test {
  id: string;
  title: string;
  template: string;
  status: 'not_tested' | 'passed' | 'failed';
}

interface Template {
  id: string;
  name: string;
  description: string;
}

export default function AddTestToStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();

  // In a real app, these would come from your backend
  const [templates] = useState<Template[]>([
    { id: "1", name: "Login Flow", description: "Standard login process testing" },
    { id: "2", name: "Checkout Process", description: "E-commerce checkout flow testing" },
    { id: "3", name: "Product Search", description: "Product search and filtering" },
    { id: "4", name: "User Profile", description: "User profile management" }
  ]);

  const [newTest, setNewTest] = useState<Partial<Test>>({
    title: "",
    template: "",
    status: 'not_tested'
  });

  const handleSubmit = () => {
    if (!newTest.title || !newTest.template) return;

    const test: Test = {
      id: Date.now().toString(),
      title: newTest.title,
      template: newTest.template,
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
                value={newTest.template}
                onChange={(e) => setNewTest(prev => ({ ...prev, template: e.target.value }))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.name}>
                    {template.name}
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