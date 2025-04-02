import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTests, useDeleteTest } from "../services/tests.service";
import type { Test, Owner } from "../services/types";
import CreateTestModal from "../components/CreateTestModal";
import PageHeader from "../components/PageHeader";
import TestFilters from "../components/TestFilters";
import TestCard from "../components/TestCard";
import NoResults from "../components/NoResults";
import Pagination from "../components/Pagination";
import { useDebounce } from "../hooks/useDebounce";

const ITEMS_PER_PAGE = 30;
const SEARCH_DELAY = 900;

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

      <TestFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedOwner={selectedOwner}
        categories={categories}
        owners={owners}
        isFetching={isFetching}
        onFilterChange={handleFilterChange}
      />

      {isLoading && !testsData ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <>
          {testsData?.data?.length === 0 ? (
            <NoResults
              searchQuery={searchQuery}
              onCreateNew={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <>
              <div className="grid gap-4">
                {testsData?.data?.map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    onEdit={() => navigate(`/tests/${test.id}/edit`)}
                    onDelete={() => handleDeleteTest(test.id)}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={testsData?.totalPages || 0}
                isFetching={isFetching}
                onPageChange={setCurrentPage}
              />
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