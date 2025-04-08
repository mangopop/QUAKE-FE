import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStories, useCreateStory, useDeleteStory, useTemplates } from "../services/stories.service";
import { useCategories } from "../services/categories.service";
import type { Story, CreateStoryRequest, Category, Owner } from "../services/types";
import CreateStoryModal from "../components/CreateStoryModal";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import TestFilters from "../components/TestFilters";

export default function Stories() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: stories, isLoading: isLoadingStories } = useStories();
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const createStory = useCreateStory();
  const deleteStory = useDeleteStory();

  const availableCategories = useMemo(() => categories || [], [categories]);
  const availableOwners = useMemo(() => {
    if (!stories) return [];
    const allOwners = stories.map(story => story.owner);
    return Array.from(new Set(allOwners.map(owner => JSON.stringify(owner))))
      .map(str => JSON.parse(str) as Owner);
  }, [stories]);

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

  const handleCreateStory = async (story: CreateStoryRequest) => {
    try {
      await createStory.mutateAsync(story);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create story:", error);
    }
  };

  const handleDeleteStory = async (id: string) => {
    try {
      await deleteStory.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete story:", error);
    }
  };

  const filteredStories = useMemo(() => {
    if (!stories) return [];
    return stories.filter(story => {
      const matchesSearch = story.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory ||
        story.categories.some(category => {
          const categoryId = typeof category === 'string' ? category : category.id.toString();
          return categoryId === selectedCategory;
        });
      const matchesOwner = !selectedOwnerId || story.owner.id === selectedOwnerId;
      return matchesSearch && matchesCategory && matchesOwner;
    });
  }, [stories, searchQuery, selectedCategory, selectedOwnerId]);

  if (isLoadingStories || isLoadingTemplates || isLoadingCategories) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <PageHeader
        title="Stories"
        onNewClick={() => setIsCreateModalOpen(true)}
        newButtonText="New Story"
      />

      <TestFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedOwnerId={selectedOwnerId}
        onOwnerChange={setSelectedOwnerId}
        categories={availableCategories}
        owners={availableOwners}
        isLoading={isLoadingCategories}
        searchPlaceholder="Search stories..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStories.map((story) => {
          const results = getTestResults(story);
          return (
            <Card
              key={story.id}
              title={story.name}
              onEdit={() => navigate(`/stories/${story.id}/edit`)}
              onDelete={() => handleDeleteStory(story.id.toString())}
              metadata={[
                { label: "templates", value: story.templates.length },
                {
                  label: "test results",
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
              tags={story.categories.map(category => ({
                text: typeof category === 'string' ? category : category.name,
                className: 'bg-blue-50 text-blue-700 border border-blue-100'
              }))}
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

      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStory}
        isSubmitting={createStory.isPending}
      />
    </div>
  );
}