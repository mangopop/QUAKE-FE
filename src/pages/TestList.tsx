import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTests, useDeleteTest } from "../services/tests.service";
import type { Test, Owner, Category } from "../services/types";
import CreateTestModal from "../components/CreateTestModal";
import OwnerInfo from "../components/OwnerInfo";
import PageHeader from "../components/PageHeader";
import SearchInput from "../components/SearchInput";
import ActionButtons from "../components/ActionButtons";
import Card from "../components/Card";
import { useDebounce } from "../hooks/useDebounce";

const ITEMS_PER_PAGE = 30;
const SEARCH_DELAY = 900; // 900ms delay for search debounce

export default function TestList() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DELAY);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedOwner, setSelectedOwner] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: testsData, isLoading, isFetching } = useTests({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(debouncedSearchQuery ? { q: debouncedSearchQuery } : {}),
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(selectedOwner ? { ownerId: selectedOwner } : {})
  });
  const deleteTest = useDeleteTest();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Extract unique categories and owners from tests
  const { categories, owners } = useMemo(() => {
    const categoriesSet = new Set<string>();
    const ownersMap = new Map<number, Owner>();

    testsData?.data?.forEach(test => {
      test.categories?.forEach(category => {
        categoriesSet.add(typeof category === 'string' ? category : category.name);
      });
      if (test.owner) {
        ownersMap.set(test.owner.id, test.owner);
      }
    });

    return {
      categories: Array.from(categoriesSet),
      owners: Array.from(ownersMap.values())
    };
  }, [testsData?.data]);

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

  // Reset to first page when filters change
  const handleFilterChange = (newValue: string | number, type: 'search' | 'category' | 'owner') => {
    switch (type) {
      case 'search':
        setSearchQuery(newValue as string);
        break;
      case 'category':
        setCurrentPage(1);
        setSelectedCategory(newValue as string);
        break;
      case 'owner':
        setCurrentPage(1);
        setSelectedOwner(newValue as number);
        break;
    }
  };

  return (
    <div className="p-4">
      <PageHeader
        title="Tests"
        onNewClick={() => setIsCreateModalOpen(true)}
        newButtonText="New Test"
      />

      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(e.target.value, 'search')}
              placeholder="Search tests..."
              className="border p-2 rounded w-full"
            />
            {isFetching && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange(e.target.value, 'category')}
              className="border p-2 rounded w-full"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <select
              value={selectedOwner}
              onChange={(e) => handleFilterChange(Number(e.target.value), 'owner')}
              className="border p-2 rounded w-full"
            >
              <option value={0}>All Owners</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.firstName} {owner.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && !testsData ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <>
          {testsData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-500 max-w-sm">
                {searchQuery
                  ? "Try adjusting your search query or filters to find what you're looking for."
                  : "Get started by creating a new test."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Create New Test
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {testsData?.data?.map((test) => (
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

              {testsData?.totalPages && testsData.totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isFetching}
                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {currentPage} of {testsData.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, testsData.totalPages))}
                    disabled={currentPage === testsData.totalPages || isFetching}
                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <CreateTestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}