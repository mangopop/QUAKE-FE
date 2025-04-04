import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStories, useCreateStory, useDeleteStory, useTemplates } from "../services/stories.service";
import type { Story } from "../services/types";
import CreateStoryModal from "../components/CreateStoryModal";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import SearchInput from "../components/SearchInput";

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: stories, isLoading: isLoadingStories } = useStories();
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const createStory = useCreateStory();
  const deleteStory = useDeleteStory();
  const navigate = useNavigate();

  // Calculate test results for a story
  const getTestResults = (story: Story) => {
    if (!story.testResults || story.testResults.length === 0) {
      return { passed: 0, total: 0, percentage: 0 };
    }

    const total = story.testResults.length;
    const passed = story.testResults.filter(result => result.status === "passed").length;
    const percentage = Math.round((passed / total) * 100);

    return { passed, total, percentage };
  };

  const getTemplateWithTests = (templateId: number) => {
    return templates?.find(t => t.id === templateId);
  };

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

  if (isLoadingStories || isLoadingTemplates) {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStories.map((story) => {
          const results = getTestResults(story);
          return (
            <Card
              key={story.id}
              title={story.name}
              owner={story.owner}
              onEdit={() => navigate(`/stories/${story.id}/edit`)}
              onDelete={() => handleDeleteStory(story.id)}
              metadata={[
                {
                  label: "templates",
                  value: story.templates.length
                },
                {
                  label: "tests passed",
                  value: `${results.passed}/${results.total}`,
                  className: results.total > 0 ? (
                    results.percentage >= 80 ? "text-green-600" :
                    results.percentage >= 50 ? "text-yellow-600" :
                    "text-red-600"
                  ) : undefined
                },
                ...(results.total > 0 ? [{
                  label: "pass rate",
                  value: `${results.percentage}%`,
                  className: results.percentage >= 80 ? "text-green-600" :
                            results.percentage >= 50 ? "text-yellow-600" :
                            "text-red-600"
                }] : [])
              ]}
              tags={results.total > 0 && results.percentage === 100 ? [
                {
                  text: "PASSED",
                  className: "bg-green-100 text-green-800 border border-green-200 font-semibold"
                }
              ] : undefined}
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
              <div className="space-y-2">
                {story.templates.map((template) => {
                  const fullTemplate = getTemplateWithTests(template.id);
                  return (
                    <div key={template.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{fullTemplate?.tests?.length || 0}</span> tests
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}