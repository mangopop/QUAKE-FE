import { Link } from "react-router-dom";
import { useState } from "react";
import { useTests, useDeleteTest } from "../services/tests.service";
import type { Test } from "../services/types";

type SortField = 'name' | 'categories';
type SortOrder = 'asc' | 'desc';

export default function TestList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const { data: tests, isLoading } = useTests();
  const deleteTest = useDeleteTest();

  const handleDeleteTest = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await deleteTest.mutateAsync(id.toString());
      } catch (error) {
        console.error('Failed to delete test:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading tests...</div>;
  }

  // Filter and sort tests
  const filteredAndSortedTests = (tests || [])
    .filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (test.notes?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'categories':
          return multiplier * (a.categories.length - b.categories.length);
        default:
          return 0;
      }
    });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Tests</h2>
        <Link
          to="/tests/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Test
        </Link>
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort by:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="border rounded-md p-2"
          >
            <option value="name">Name</option>
            <option value="categories">Number of Categories</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="border p-2 rounded"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAndSortedTests.map((test) => (
          <div key={test.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{test.name}</h3>
                {test.notes && (
                  <p className="text-gray-600">{test.notes}</p>
                )}
                <p className="text-sm text-gray-500">
                  Categories: {test.categories.length}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/tests/${test.id}/edit`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteTest(test.id)}
                  disabled={deleteTest.isPending}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  {deleteTest.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            {test.categories.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {test.categories.map((category, index) => (
                    <div key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      Category {index + 1}
                    </div>
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