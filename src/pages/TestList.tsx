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

const ITEMS_PER_PAGE = 30;

export default function TestList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedOwner, setSelectedOwner] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: testsData, isLoading } = useTests({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(searchQuery ? { q: searchQuery } : {}),
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
    setCurrentPage(1);
    switch (type) {
      case 'search':
        setSearchQuery(newValue as string);
        break;
      case 'category':
        setSelectedCategory(newValue as string);
        break;
      case 'owner':
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
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(e.target.value, 'search')}
              placeholder="Search tests..."
              className="border p-2 rounded w-full"
            />
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
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {testsData.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, testsData.totalPages))}
            disabled={currentPage === testsData.totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      <CreateTestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}