import { useState } from "react";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from "../services/templates.service";
import type { Template, Section } from "../services/types";

export default function Templates() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<{ name: string; content: string; sections: Section[] }>({
    name: "",
    content: "",
    sections: []
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { data: templatesData, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const handleCreateTemplate = async () => {
    try {
      await createTemplate.mutateAsync({
        name: newTemplate.name,
        content: newTemplate.content,
        sections: []
      });
      setNewTemplate({ name: "", content: "", sections: [] });
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleUpdateTemplate = async (id: string, updatedData: Partial<Template>) => {
    try {
      await updateTemplate.mutateAsync({ id, data: updatedData });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  const templates = templatesData?.data || [];
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Templates</h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Create new template form */}
      <div className="mb-4 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Create New Template</h3>
        <input
          type="text"
          placeholder="Template Name"
          value={newTemplate.name}
          onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          placeholder="Template Content"
          value={newTemplate.content}
          onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
          className="border p-2 rounded w-full mb-2"
          rows={4}
        />
        <button
          onClick={handleCreateTemplate}
          disabled={createTemplate.isPending}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {createTemplate.isPending ? 'Creating...' : 'Create Template'}
        </button>
      </div>

      {/* Templates list */}
      <div className="space-y-4">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="p-4 border rounded">
            {editingId === template.id ? (
              <>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => handleUpdateTemplate(template.id, { name: e.target.value })}
                  className="border p-2 rounded w-full mb-2"
                />
                <textarea
                  value={template.content}
                  onChange={(e) => handleUpdateTemplate(template.id, { content: e.target.value })}
                  className="border p-2 rounded w-full mb-2"
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <p className="mt-2 whitespace-pre-wrap">{template.content}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEditingId(template.id)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    disabled={deleteTemplate.isPending}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleteTemplate.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                {template.sections.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Sections</h4>
                    <div className="space-y-2">
                      {template.sections.map((section, index) => (
                        <div key={index} className="border-t pt-2">
                          <div className="font-medium">{section.name}</div>
                          <p className="text-gray-600">{section.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}