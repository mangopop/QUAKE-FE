import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStory, useUpdateStory, useTemplates } from "../services/stories.service";
import { useCategories } from "../services/categories.service";
import type { Story, Template, Category, UpdateStoryRequest } from "../services/types";

export default function EditStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { data: story, isLoading: isLoadingStory } = useStory(storyId || "");
  const { data: availableTemplates, isLoading: isLoadingTemplates } = useTemplates();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const updateStory = useUpdateStory();
  const [editedStory, setEditedStory] = useState<Story | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templateTestCounts, setTemplateTestCounts] = useState<Record<number, number>>({});

  // Initialize editedStory when story data is loaded
  useEffect(() => {
    if (story) {
      setEditedStory(story);
    }
  }, [story]);

  // Update test counts when templates are loaded
  useEffect(() => {
    if (availableTemplates) {
      const counts: Record<number, number> = {};
      availableTemplates.forEach(template => {
        counts[template.id] = template.tests?.length || 0;
      });
      setTemplateTestCounts(counts);
    }
  }, [availableTemplates]);

  if (isLoadingStory || isLoadingTemplates || isLoadingCategories) {
    return <div className="p-4">Loading story details...</div>;
  }

  if (!story || !editedStory || !availableTemplates || !categories) {
    return <div className="p-4">Story not found</div>;
  }

  const handleSubmit = async () => {
    if (!storyId) return;

    try {
      const updateData: UpdateStoryRequest = {
        name: editedStory.name,
        templateIds: editedStory.templates.map(template => template.id),
        categoryIds: editedStory.categories.map(cat =>
          typeof cat === 'string' ? parseInt(cat) : cat.id
        )
      };
      await updateStory.mutateAsync({
        id: storyId,
        data: updateData
      });
      navigate('/stories');
    } catch (error) {
      console.error('Failed to update story:', error);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedStory({
      ...editedStory,
      name: e.target.value
    });
  };

  const handleCategoryToggle = (categoryId: number) => {
    setEditedStory(prev => {
      if (!prev) return prev;

      const currentCategories = prev.categories || [];
      const categoryExists = currentCategories.some(cat =>
        (typeof cat === 'string' ? cat : cat.id.toString()) === categoryId.toString()
      );

      return {
        ...prev,
        categories: categoryExists
          ? currentCategories.filter(cat =>
              (typeof cat === 'string' ? cat : cat.id.toString()) !== categoryId.toString()
            )
          : [...currentCategories, categories.find(c => c.id === categoryId)!]
      };
    });
  };

  const handleAddTemplate = () => {
    if (!selectedTemplateId) return;

    const templateToAdd = availableTemplates.find((t: Template) => t.id === Number(selectedTemplateId));
    if (!templateToAdd) return;

    // Check if template is already added
    if (!editedStory.templates.some((t: Template) => t.id === templateToAdd.id)) {
      setEditedStory({
        ...editedStory,
        templates: [...editedStory.templates, templateToAdd]
      });
    }
    setSelectedTemplateId("");
  };

  const handleRemoveTemplate = (templateId: number) => {
    setEditedStory({
      ...editedStory,
      templates: editedStory.templates.filter((t: Template) => t.id !== templateId)
    });
  };

  // Get templates that are not already added to the story
  const availableTemplatesToAdd = availableTemplates.filter(
    (template: Template) => !editedStory.templates.some((t: Template) => t.id === template.id)
  );

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Story</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/stories')}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={updateStory.isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Story Name
              </label>
              <input
                type="text"
                value={editedStory.name}
                onChange={handleNameChange}
                className="w-full border rounded p-2"
                placeholder="Enter story name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categories
              </label>
              <div className="space-y-2">
                {categories.map((category: Category) => (
                  <label key={category.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedStory.categories?.some(cat =>
                        (typeof cat === 'string' ? cat : cat.id.toString()) === category.id.toString()
                      )}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Templates</h3>
                <div className="flex gap-2">
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="border rounded p-2 pr-8"
                  >
                    <option value="">Select a template</option>
                    {availableTemplatesToAdd.map((template: Template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddTemplate}
                    disabled={!selectedTemplateId}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Add Template
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {editedStory.templates?.map((template: Template) => (
                  <div key={template.id} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{templateTestCounts[template.id] || 0}</span> tests
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveTemplate(template.id)}
                      className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                {(!editedStory.templates || editedStory.templates.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No templates associated with this story</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
