import { Owner } from "../services/types";

interface TestFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  selectedOwner: number;
  categories: string[];
  owners: Owner[];
  isFetching: boolean;
  onFilterChange: (value: string | number, type: 'search' | 'category' | 'owner') => void;
}

export default function TestFilters({
  searchQuery,
  selectedCategory,
  selectedOwner,
  categories,
  owners,
  isFetching,
  onFilterChange
}: TestFiltersProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onFilterChange(e.target.value, 'search')}
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
            onChange={(e) => onFilterChange(e.target.value, 'category')}
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
            onChange={(e) => onFilterChange(Number(e.target.value), 'owner')}
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
  );
}