import React, { useState, useMemo, useEffect } from 'react'
import { useTests, useDeleteTest } from '../services/tests.service'
import TestFilters from '../components/TestFilters'
import TestCard from '../components/TestCard'
import NoResults from '../components/NoResults'
import Pagination from '../components/Pagination'
import type { Test, Owner, Category } from '../services/types'

export default function TestList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedOwnerId, setSelectedOwnerId] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to first page when search changes
    }, 900)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: testsData, isLoading, isFetching } = useTests({
    page: currentPage,
    limit: itemsPerPage,
    q: debouncedSearch,
    category: selectedCategory,
    ownerId: selectedOwnerId || undefined
  })

  const deleteMutation = useDeleteTest()

  const categories = useMemo(() => {
    if (!testsData?.data) return []
    const allCategories = testsData.data.flatMap((test: Test) =>
      test.categories.map(cat => typeof cat === 'string' ? cat : cat.name)
    )
    return Array.from(new Set(allCategories))
  }, [testsData?.data])

  const owners = useMemo(() => {
    if (!testsData?.data) return []
    const allOwners = testsData.data.map((test: Test) => test.owner)
    return Array.from(new Set(allOwners.map((owner: Owner) => JSON.stringify(owner))))
      .map((str: string) => JSON.parse(str) as Owner)
  }, [testsData?.data])

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id)
  }

  const handleCreateNew = () => {
    // TODO: Implement create new test functionality
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tests</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          onClick={handleCreateNew}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Test
        </button>
      </div>

      <TestFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedOwnerId={selectedOwnerId}
        onOwnerChange={setSelectedOwnerId}
        categories={categories}
        owners={owners}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div
            role="status"
            data-testid="loading-spinner"
            className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"
          />
        </div>
      ) : (
        <>
          {testsData?.data.length === 0 ? (
            <NoResults
              searchQuery={searchQuery}
              onCreateNew={handleCreateNew}
            />
          ) : (
            <div className="grid gap-4">
              {testsData?.data.map(test => (
                <TestCard
                  key={test.id}
                  test={test}
                  onEdit={() => {}}
                  onDelete={() => handleDelete(test.id)}
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={testsData?.totalPages || 1}
            isFetching={isFetching}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}