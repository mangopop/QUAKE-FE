import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStories, useCreateStory, useDeleteStory, useTestsByTemplate, storiesService } from "../services/stories.service";
import type { Story } from "../services/types";
import CreateStoryModal from "../components/CreateStoryModal";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import SearchInput from "../components/SearchInput";

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: stories, isLoading } = useStories();
  const createStory = useCreateStory();
  const deleteStory = useDeleteStory();
  const [templateTestCounts, setTemplateTestCounts] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  // Fetch test counts for all templates
  useEffect(() => {
    const fetchTestCounts = async () => {
      if (!stories) return;

      const counts: Record<number, number> = {};

      for (const story of stories) {
        for (const template of story.templates) {
          try {
            const tests = await storiesService.getTestsByTemplate(template.id);
            counts[template.id] = tests.length;
          } catch (error) {
            console.error(`Error fetching tests for template ${template.id}:`, error);
            counts[template.id] = 0;
          }
        }
      }

      setTemplateTestCounts(counts);
    };

    fetchTestCounts();
  }, [stories]);

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
      <PageHeader
        title="Stories"
        onNewClick={() => setIsCreateModalOpen(true)}
        newButtonText="New Story"
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search stories..."
      />

      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStory}
        isSubmitting={createStory.isPending}
      />

      <div className="grid gap-4">
        {filteredStories.map((story) => (
          <Card
            key={story.id}
            title={story.name}
            owner={story.owner}
            onEdit={() => navigate(`/stories/${story.id}/edit`)}
            onDelete={() => handleDeleteStory(story.id)}
            metadata={[
              { label: "templates", value: story.templates.length }
            ]}
            actionButton={{
              label: "Run",
              onClick: () => navigate(`/stories/${story.id}/run`),
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            }}
          >
            {story.templates.map((template) => (
              <div key={template.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{templateTestCounts[template.id] || 0}</span> tests
                  </div>
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}