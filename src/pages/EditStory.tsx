import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStory, useUpdateStory } from "../services/stories.service";
import type { Story, Template } from "../services/types";

export default function EditStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { data: story, isLoading: isLoadingStory } = useStory(storyId || "");
  const updateStory = useUpdateStory();
  const [editedStory, setEditedStory] = useState<Story | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");

  // Initialize editedStory when story data is loaded
  useEffect(() => {
    if (story) {
      setEditedStory(story);
    }
  }, [story]);

  if (isLoadingStory) {
    return <div className="p-4">Loading story details...</div>;
  }

  if (!story || !editedStory) {
    return <div className="p-4">Story not found</div>;
  }

  const handleSubmit = async () => {
    if (!storyId) return;

    try {
      await updateStory.mutateAsync({
        id: storyId,
        data: editedStory
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

  const handleAddTemplate = () => {
    if (!newTemplateName.trim()) return;

    // Create a new template with the required properties
    const newTemplate: Template = {
      id: Date.now(), // Temporary ID for new templates
      name: newTemplateName.trim(),
      owner: [], // Empty array for now
      tests: [], // Empty array for now
      stories: [] // Empty array for now
    };

    setEditedStory({
      ...editedStory,
      templates: [...(editedStory.templates || []), newTemplate]
    });
    setNewTemplateName("");
  };

  const handleRemoveTemplate = (templateId: number) => {
    setEditedStory({
      ...editedStory,
      templates: editedStory.templates.filter(t => t.id !== templateId)
    });
  };

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
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Templates</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="border rounded p-2"
                    placeholder="New template name"
                  />
                  <button
                    onClick={handleAddTemplate}
                    disabled={!newTemplateName.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Add Template
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {editedStory.templates?.map(template => (
                  <div key={template.id} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">
                        {template.tests?.length || 0} tests
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveTemplate(template.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {(!editedStory.templates || editedStory.templates.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No templates associated with this story</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Test Results</h3>
              <div className="space-y-2">
                {editedStory.testResults?.map(result => (
                  <div key={result.id} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{result.test.name}</h4>
                        <p className="text-sm text-gray-600">
                          Status: {result.passed ? 'Passed' : 'Failed'}
                        </p>
                        {result.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            Notes: {result.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(!editedStory.testResults || editedStory.testResults.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No test results yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
