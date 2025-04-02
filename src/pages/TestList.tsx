import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTests, useDeleteTest } from "../services/tests.service";
import type { Test, Owner } from "../services/types";
import CreateTestModal from "../components/CreateTestModal";
import OwnerInfo from "../components/OwnerInfo";
import PageHeader from "../components/PageHeader";
import SearchInput from "../components/SearchInput";
import ActionButtons from "../components/ActionButtons";
import Card from "../components/Card";

export default function TestList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: tests, isLoading } = useTests();
  const deleteTest = useDeleteTest();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDeleteTest = async (id: number) => {
    try {
      await deleteTest.mutateAsync(id.toString());
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const filteredTests = (tests || []).filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <PageHeader
        title="Tests"
        onNewClick={() => setIsCreateModalOpen(true)}
        newButtonText="New Test"
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search tests..."
      />

      <div className="grid gap-4">
        {filteredTests.map((test) => (
          <Card key={test.id}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-4 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                  <span className="text-sm text-gray-600">
                    <span className="font-medium">{test.sections?.length || 0}</span> sections
                  </span>
                  <span className="text-sm text-gray-600">
                    <span className="font-medium">{test.categories?.length || 0}</span> categories
                  </span>
                  {test.owner && <OwnerInfo owner={test.owner} />}
                </div>
                {test.notes && (
                  <p className="text-sm text-gray-500">{test.notes}</p>
                )}
                {test.categories && test.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {test.categories.map((category, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {typeof category === 'string' ? category : category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ActionButtons
                onEdit={() => navigate(`/tests/${test.id}/edit`)}
                onDelete={() => handleDeleteTest(test.id)}
              />
            </div>

            <div className="space-y-3">
              {test.sections.map((section, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{section.name}</h4>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <CreateTestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}