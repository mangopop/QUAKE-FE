import React from 'react'
import type { Owner, Category } from '../services/types'

interface TestFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedOwnerId: number
  onOwnerChange: (ownerId: number) => void
  categories: Category[]
  owners: Owner[]
  isLoading?: boolean
  searchPlaceholder?: string
}

const TestFilters: React.FC<TestFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedOwnerId,
  onOwnerChange,
  categories,
  owners,
  isLoading = false,
  searchPlaceholder = "Search tests..."
}) => {
  return (
    <div className="mb-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border p-2 rounded w-full"
          />
          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="border p-2 rounded w-full"
            aria-label="Filter by category"
          >
            <option key="all-categories" value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <select
            value={selectedOwnerId}
            onChange={(e) => onOwnerChange(Number(e.target.value))}
            className="border p-2 rounded w-full"
            aria-label="Filter by owner"
          >
            <option key="all-owners" value={0}>All Owners</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.firstName} {owner.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default TestFilters