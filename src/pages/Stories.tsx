import { useState } from "react";
import { Link } from "react-router-dom";

interface Test {
  id: string;
  title: string;
  template: string;
  status: 'not_tested' | 'passed' | 'failed';
}

interface Story {
  id: string;
  title: string;
  description: string;
  tests: Test[];
  createdAt: string;
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([
    {
      id: "1",
      title: "User Registration Flow",
      description: "Complete user registration process including email verification and profile setup",
      tests: [
        {
          id: "1",
          title: "Email Registration",
          template: "Login Flow",
          status: 'passed'
        },
        {
          id: "2",
          title: "Profile Setup",
          template: "User Profile",
          status: 'not_tested'
        }
      ],
      createdAt: "2024-03-20T10:00:00Z"
    },
    {
      id: "2",
      title: "E-commerce Purchase Flow",
      description: "Complete purchase process from product selection to order confirmation",
      tests: [
        {
          id: "3",
          title: "Product Selection",
          template: "Product Search",
          status: 'passed'
        },
        {
          id: "4",
          title: "Checkout Process",
          template: "Checkout Process",
          status: 'not_tested'
        }
      ],
      createdAt: "2024-03-19T15:30:00Z"
    }
  ]);

  const [showNewStoryForm, setShowNewStoryForm] = useState(false);
  const [newStory, setNewStory] = useState<Partial<Story>>({
    title: "",
    description: "",
    tests: []
  });

  const handleSubmit = () => {
    if (!newStory.title || !newStory.description) return;

    const story: Story = {
      id: Date.now().toString(),
      title: newStory.title,
      description: newStory.description,
      tests: newStory.tests || [],
      createdAt: new Date().toISOString()
    };

    setStories(prev => [...prev, story]);
    resetForm();
  };

  const resetForm = () => {
    setNewStory({ title: "", description: "", tests: [] });
    setShowNewStoryForm(false);
  };

  const addTestToStory = (storyId: string, test: Test) => {
    setStories(prev => prev.map(story =>
      story.id === storyId
        ? { ...story, tests: [...story.tests, test] }
        : story
    ));
  };

  const removeTestFromStory = (storyId: string, testId: string) => {
    setStories(prev => prev.map(story =>
      story.id === storyId
        ? { ...story, tests: story.tests.filter(test => test.id !== testId) }
        : story
    ));
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

  const getStoryStatus = (story: Story): Test['status'] => {
    if (story.tests.length === 0) return 'not_tested';
    if (story.tests.some(test => test.status === 'failed')) return 'failed';
    if (story.tests.every(test => test.status === 'passed')) return 'passed';
    return 'not_tested';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Test Stories</h2>
        <button
          onClick={() => setShowNewStoryForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Story
        </button>
      </div>

      {showNewStoryForm && (
        <div className="mb-8 p-4 border rounded-lg bg-white">
          <h3 className="text-lg font-semibold mb-4">New Test Story</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Story Title</label>
              <input
                type="text"
                value={newStory.title}
                onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                placeholder="Enter story title"
                autoComplete="off"
                data-form-type="other"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newStory.description}
                onChange={(e) => setNewStory(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                placeholder="Enter story description"
                rows={3}
                autoComplete="off"
                data-form-type="other"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create Story
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {stories.map((story) => (
          <div key={story.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{story.title}</h3>
                  <span className={`${getStatusColor(getStoryStatus(story))}`}>
                    {getStatusIcon(getStoryStatus(story))}
                  </span>
                </div>
                <p className="text-gray-600">{story.description}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(story.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/stories/${story.id}/edit`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this story?')) {
                      setStories(prev => prev.filter(s => s.id !== story.id));
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Tests in this Story</h4>
                <Link
                  to={`/stories/${story.id}/add-test`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  + Add Test
                </Link>
              </div>
              {story.tests.map((test) => (
                <div key={test.id} className="flex items-center justify-between border-t pt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{test.title}</span>
                    <span className="text-sm text-gray-500">({test.template})</span>
                    <span className={`${getStatusColor(test.status)}`}>
                      {getStatusIcon(test.status)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/tests/${test.id}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Run Test
                    </Link>
                    <button
                      onClick={() => removeTestFromStory(story.id, test.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}