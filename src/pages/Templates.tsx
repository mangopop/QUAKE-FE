import { useState } from "react";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from "../services/templates.service";
import { useTests } from "../services/tests.service";
import type { Template, Test, CreateTemplateRequest } from "../services/types";
import CreateTemplateModal from "../components/CreateTemplateModal";

export default function Templates() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const { data: tests, isLoading: isLoadingTests } = useTests();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const handleCreateTemplate = async (template: CreateTemplateRequest) => {
    try {
      await createTemplate.mutateAsync(template);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleUpdateTemplate = async (id: number, updatedData: Partial<CreateTemplateRequest>) => {
    try {
      await updateTemplate.mutateAsync({ id: id.toString(), data: updatedData });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      await deleteTemplate.mutateAsync(id.toString());
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const toggleTestSelection = (testId: number, isEditing: boolean = false) => {
    if (isEditing && editingId !== null) {
      const template = templates?.find(t => t.id === editingId);
      if (!template) return;

      const currentTestIds = template.tests.map(t => t.id);
      const newTestIds = currentTestIds.includes(testId)
        ? currentTestIds.filter(id => id !== testId)
        : [...currentTestIds, testId];

      handleUpdateTemplate(editingId, { testIds: newTestIds });
    }
  };

  if (isLoadingTemplates || isLoadingTests) {
    return <div>Loading...</div>;
  }

  const filteredTemplates = (templates || []).filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Templates</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Template
        </button>
      </div>

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

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTemplate}
        isSubmitting={createTemplate.isPending}
      />

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

                {/* Test Selection for Editing */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Select Tests</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto border p-2 rounded">
                    {tests?.map((test) => (
                      <label key={test.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={template.tests.some(t => t.id === test.id)}
                          onChange={() => toggleTestSelection(test.id, true)}
                          className="rounded"
                        />
                        <span>{test.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

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
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Tests: {template.tests.length}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
                </div>

                {template.tests.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Tests</h4>
                    <div className="space-y-2">
                      {template.tests.map((test) => (
                        <div key={test.id} className="border-t pt-2">
                          <div className="font-medium">{test.name}</div>
                          {test.notes && (
                            <p className="text-gray-600 text-sm">{test.notes}</p>
                          )}
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