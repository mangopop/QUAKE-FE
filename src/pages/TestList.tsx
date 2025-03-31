import { Link } from "react-router-dom";
import { useState } from "react";
import { useTests, useDeleteTest, useCreateTest } from "../services/tests.service";
import type { Test, CreateTestRequest } from "../services/types";
import CreateTestModal from "../components/CreateTestModal";

type SortField = 'name' | 'categories';

export default function TestList() {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: tests, isLoading } = useTests();
  const deleteTest = useDeleteTest();
  const createTest = useCreateTest();

  const handleCreateTest = async (test: CreateTestRequest) => {
    try {
      await createTest.mutateAsync(test);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create test:', error);
    }
  };

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
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.notes && test.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedTests = [...filteredTests].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === 'asc'
        ? a.categories.length - b.categories.length
        : b.categories.length - a.categories.length;
    }
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tests</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Test
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

      {/* Sort */}
      <div className="mb-4 flex gap-4">
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="border p-2 rounded"
        >
          <option value="name">Name</option>
          <option value="categories">Categories</option>
        </select>
        <button
          onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="border p-2 rounded"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Create Test Modal */}
      <CreateTestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTest}
        isSubmitting={createTest.isPending}
      />

      {/* Tests list */}
      <div className="space-y-4">
        {sortedTests.map((test) => (
          <div key={test.id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{test.name}</h3>
                {test.notes && (
                  <p className="text-gray-600 mt-1">{test.notes}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Categories: {test.categories.length}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/tests/${test.id}/edit`}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteTest(test.id)}
                  disabled={deleteTest.isPending}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteTest.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            {test.categories.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {test.categories.map((category) => (
                    <span
                      key={category.id}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}