import { useState } from "react";
import { Link } from "react-router-dom";
import { useStories, useCreateStory, useDeleteStory } from "../services/stories.service";
import type { Story } from "../services/types";
import CreateStoryModal from "../components/CreateStoryModal";

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: stories, isLoading } = useStories();
  const createStory = useCreateStory();
  const deleteStory = useDeleteStory();

  const handleCreateStory = async (story: { name: string; templateIds: number[] }) => {
    try {
      await createStory.mutateAsync(story);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create story:', error);
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
    return <div>Loading...</div>;
  }

  const filteredStories = (stories || []).filter(story =>
    story.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Stories</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Story
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

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStory}
        isSubmitting={createStory.isPending}
      />

      {/* Stories list */}
      <div className="space-y-4">
        {filteredStories.map((story) => (
          <div key={story.id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <Link to={`/stories/${story.id}`} className="text-lg font-semibold hover:text-blue-600">
                  {story.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  Templates: {story.templates.length}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/stories/${story.id}`}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  View
                </Link>
                <Link
                  to={`/stories/${story.id}/edit`}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Edit
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

            {story.templates.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Templates</h4>
                <div className="space-y-2">
                  {story.templates.map((template) => (
                    <div key={template.id} className="border-t pt-2">
                      <div className="font-medium">{template.name}</div>
                      <p className="text-sm text-gray-600">
                        {template.tests?.length || 0} tests
                      </p>
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