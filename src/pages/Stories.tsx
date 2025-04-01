import { useState } from "react";
import { Link } from "react-router-dom";
import { useStories, useCreateStory, useUpdateStory, useDeleteStory } from "../services/stories.service";
import type { Story, CreateStoryRequest } from "../services/types";

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newStory, setNewStory] = useState<CreateStoryRequest>({
    name: "",
    templateIds: []
  });

  const { data: stories, isLoading } = useStories();
  const createStory = useCreateStory();
  const updateStory = useUpdateStory();
  const deleteStory = useDeleteStory();

  const handleCreateStory = async () => {
    if (!newStory.name) return;

    try {
      await createStory.mutateAsync(newStory);
      setNewStory({ name: "", templateIds: [] });
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  const handleUpdateStory = async (id: number, data: Partial<Story>) => {
    try {
      await updateStory.mutateAsync({ id: id.toString(), data });
    } catch (error) {
      console.error('Failed to update story:', error);
    }
  };

  const handleDeleteStory = async (id: number) => {
    try {
      await deleteStory.mutateAsync(id.toString());
    } catch (error) {
      console.error('Failed to delete story:', error);
    }
  };

  if (isLoading) {
    return <div>Loading stories...</div>;
  }

  const filteredStories = (stories || []).filter(story =>
    story.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Stories</h2>
        <button
          onClick={() => setNewStory({ name: "", templateIds: [] })}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create New Story
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search stories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full"
        />
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
                <p className="text-gray-600 mt-1">
                  Created by {story.owner.firstName} {story.owner.lastName}
                </p>
                <p className="text-gray-600 mt-1">
                  Templates: {story.templates.length}
                </p>
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
          </div>
        ))}
      </div>
    </div>
  );
}