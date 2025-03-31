import { useState } from "react";
import { Link } from "react-router-dom";
import { useStories, useCreateStory, useUpdateStory, useDeleteStory } from "../services/stories.service";
import type { Story } from "../services/types";

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [newStory, setNewStory] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  });

  const { data: storiesData, isLoading } = useStories();
  const createStory = useCreateStory();
  const updateStory = useUpdateStory();
  const deleteStory = useDeleteStory();

  const handleCreateStory = async () => {
    if (!newStory.name || !newStory.description) return;

    try {
      await createStory.mutateAsync({
        name: newStory.name,
        description: newStory.description,
        tests: []
      });
      setNewStory({ name: "", description: "" });
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  const handleUpdateStory = async (id: string, data: Partial<Story>) => {
    try {
      await updateStory.mutateAsync({ id, data });
    } catch (error) {
      console.error('Failed to update story:', error);
    }
  };

  const handleDeleteStory = async (id: string) => {
    try {
      await deleteStory.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete story:', error);
    }
  };

  if (isLoading) {
    return <div>Loading stories...</div>;
  }

  const stories = storiesData?.data || [];
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (story.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" ||
                         (story.tests || []).some(test => test.status === selectedStatus);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Stories</h2>
        <button
          onClick={() => setNewStory({ name: "", description: "" })}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create New Story
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search stories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Statuses</option>
          <option value="not_tested">Not Tested</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Create Story Form */}
      <div className="mb-4 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Create New Story</h3>
        <input
          type="text"
          placeholder="Story Name"
          value={newStory.name}
          onChange={(e) => setNewStory({ ...newStory, name: e.target.value })}
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          placeholder="Story Description"
          value={newStory.description}
          onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
          className="border p-2 rounded w-full mb-2"
          rows={4}
        />
        <button
          onClick={handleCreateStory}
          disabled={createStory.isPending}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {createStory.isPending ? 'Creating...' : 'Create Story'}
        </button>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {filteredStories.map((story) => (
          <div key={story.id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{story.name}</h3>
                <p className="text-gray-600 mt-1">{story.description}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/stories/${story.id}`}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDeleteStory(story.id)}
                  disabled={deleteStory.isPending}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteStory.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            {story.tests && story.tests.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Tests</h4>
                <div className="space-y-2">
                  {story.tests.map((test) => (
                    <div key={test.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{test.name}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        test.status === 'passed' ? 'bg-green-100 text-green-800' :
                        test.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {test.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}