import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTemplates, useDeleteTemplate } from "../services/templates.service";
import type { Template } from "../services/types";
import CreateTemplateModal from "../components/CreateTemplateModal";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import SearchInput from "../components/SearchInput";

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: templates, isLoading } = useTemplates();
  const deleteTemplate = useDeleteTemplate();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDeleteTemplate = async (id: number) => {
    try {
      await deleteTemplate.mutateAsync(id.toString());
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const filteredTemplates = (templates || []).filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <PageHeader
        title="Templates"
        onNewClick={handleCreateNew}
        newButtonText="New Template"
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search templates..."
      />

      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            title={template.name}
            owner={template.owner}
            onEdit={() => navigate(`/templates/${template.id}/edit`)}
            onDelete={() => handleDeleteTemplate(template.id)}
            metadata={[
              { label: "tests", value: template.tests.length }
            ]}
          >
            {template.tests.map((test) => (
              <div key={test.id} className="bg-gray-50 rounded-lg p-3">
                <div>
                  <h4 className="font-medium text-gray-900">{test.name}</h4>
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}