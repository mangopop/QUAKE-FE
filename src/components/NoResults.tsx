interface NoResultsProps {
  searchQuery: string;
  onCreateNew: () => void;
}

export default function NoResults({ searchQuery, onCreateNew }: NoResultsProps) {
  return (
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
          onClick={onCreateNew}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Create New Test
        </button>
      )}
    </div>
  );
}