import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTests, useDeleteTest } from "../services/tests.service";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import SearchInput from "../components/SearchInput";

export default function Tests() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: testsData, isLoading } = useTests();
  const deleteTest = useDeleteTest();
  const navigate = useNavigate();

  const handleDeleteTest = async (id: number) => {
    try {
      await deleteTest.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const filteredTests = (testsData?.data || []).filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <PageHeader
        title="Tests"
        onNewClick={() => navigate('/tests/new')}
        newButtonText="New Test"
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search tests..."
      />

      <div className="grid gap-4">
        {filteredTests.map((test) => (
          <Card
            key={test.id}
            title={test.name}
            owner={test.owner}
            onEdit={() => navigate(`/tests/${test.id}/edit`)}
            onDelete={() => handleDeleteTest(test.id)}
            metadata={[
              { label: "categories", value: test.categories.length }
            ]}
            actionButton={{
              label: "View Details",
              onClick: () => navigate(`/tests/${test.id}`),
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )
            }}
          >
            {test.sections.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div>
                  <h4 className="font-medium text-gray-900">{section.name}</h4>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}