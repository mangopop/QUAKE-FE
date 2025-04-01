import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTests, useDeleteTest } from "../services/tests.service";
import type { Test } from "../services/types";
import CreateTestModal from "../components/CreateTestModal";

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tests</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Test
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="grid gap-4">
        {filteredTests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">{test.sections?.length || 0}</span> sections
                    </span>
                  </div>
                  {test.notes && (
                    <p className="text-sm text-gray-500">{test.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/tests/${test.id}/edit`)}
                    className="text-gray-500 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition-colors"
                    title="Edit Test"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete Test"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {test.sections.map((section, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{section.name}</h4>
                        <p className="text-sm text-gray-500">{section.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{test.categories.length}</span> categories
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateTestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}