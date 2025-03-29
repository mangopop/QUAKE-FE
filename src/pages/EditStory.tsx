import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

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

export default function EditStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);

  // Load story from localStorage on component mount
  useEffect(() => {
    const savedStories = JSON.parse(localStorage.getItem('stories') || '[]');
    const foundStory = savedStories.find((s: Story) => s.id === storyId);
    if (foundStory) {
      setStory(foundStory);
    } else {
      navigate('/stories');
    }
  }, [storyId, navigate]);

  const handleSubmit = () => {
    if (!story) return;

    // Get existing stories from localStorage
    const existingStories = JSON.parse(localStorage.getItem('stories') || '[]');

    // Update the stories array with the edited story
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

  const handleDeleteTest = (testId: string) => {
    if (!story) return;
    setStory({
      ...story,
      tests: story.tests.filter(test => test.id !== testId)
    });
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

  if (!story) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Story</h2>
          <button
            onClick={() => navigate('/stories')}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Story Title</label>
              <input
                type="text"
                value={story.title}
                onChange={(e) => setStory({ ...story, title: e.target.value })}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                placeholder="Enter story title"
                autoComplete="off"
                data-form-type="other"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={story.description}
                onChange={(e) => setStory({ ...story, description: e.target.value })}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                placeholder="Enter story description"
                rows={3}
                autoComplete="off"
                data-form-type="other"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Tests in this Story</h3>
                <button
                  onClick={() => navigate(`/stories/${story.id}/add-test`)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  + Add Test
                </button>
              </div>

              <div className="space-y-2">
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
                        to={`/stories/${story.id}/run?testIndex=${story.tests.findIndex(t => t.id === test.id)}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Run Test
                      </Link>
                      <button
                        onClick={() => handleDeleteTest(test.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
