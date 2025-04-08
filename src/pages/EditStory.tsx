import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStory, useUpdateStory, useTemplates } from "../services/stories.service";
import { useCategories } from "../services/categories.service";
import type { Story, Template, Category, UpdateStoryRequest } from "../services/types";
import FormInput from '../components/common/FormInput';
import FormCheckboxGroup from '../components/common/FormCheckboxGroup';
import FormSelect from '../components/common/FormSelect';
import ButtonGroup from '../components/common/ButtonGroup';
import DeleteIcon from '../components/common/DeleteIcon';
import EditIcon from '../components/common/EditIcon';
import ActionButtons from '../components/ActionButtons';

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

  const handleNameChange = (value: string) => {
    setEditedStory({
      ...editedStory,
      name: value
    });
  };

  const handleCategoryChange = (selectedIds: string[]) => {
    setEditedStory(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: selectedIds.map(id => categories.find(c => c.id.toString() === id)!)
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

  const handleEditTemplate = (templateId: number) => {
    // Implementation of handleEditTemplate function
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Story</h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="space-y-4">
            <FormInput
              label="Story Name"
              value={editedStory.name}
              onChange={handleNameChange}
              placeholder="Enter story name"
              required
            />

            <FormCheckboxGroup
              label="Categories"
              options={categories.map(category => ({
                id: category.id.toString(),
                label: category.name
              }))}
              selectedValues={editedStory.categories.map(cat =>
                (typeof cat === 'string' ? cat : cat.id.toString())
              )}
              onChange={handleCategoryChange}
            />

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Templates</h3>
                <div className="flex items-center gap-2">
                  <FormSelect
                    label=""
                    value={selectedTemplateId}
                    onChange={setSelectedTemplateId}
                    options={availableTemplatesToAdd.map(template => ({
                      value: template.id.toString(),
                      label: template.name
                    }))}
                    placeholder="Select a template"
                    className="w-64"
                  />
                  <button
                    type="button"
                    onClick={handleAddTemplate}
                    disabled={!selectedTemplateId}
                    className="p-2 -mt-[1px] bg-green-500 text-white text-sm rounded border border-transparent hover:bg-green-600 disabled:opacity-50"
                  >
                    Add
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
                    <ActionButtons
                      onEdit={() => handleEditTemplate(template.id)}
                      onDelete={() => handleRemoveTemplate(template.id)}
                    />
                  </div>
                ))}
                {(!editedStory.templates || editedStory.templates.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No templates associated with this story</p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <ButtonGroup
                onSubmit={handleSubmit}
                onCancel={() => navigate('/stories')}
                submitText="Save Changes"
                isSubmitDisabled={updateStory.isPending}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
