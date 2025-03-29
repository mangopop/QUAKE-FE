interface CategoryManagerProps {
  categories: string[];
  onClose: () => void;
  onUpdateCategories: (categories: string[]) => void;
}

export default function CategoryManager({ categories, onClose, onUpdateCategories }: CategoryManagerProps) {
  const handleAddCategory = (newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
      onUpdateCategories([...categories, newCategory]);
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    onUpdateCategories(categories.filter(cat => cat !== categoryToDelete));
  };

  const handleRenameCategory = (oldCategory: string, newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
      onUpdateCategories(categories.map(cat =>
        cat === oldCategory ? newCategory : cat
      ));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Manage Categories</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Category
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter category name"
                className="flex-1 border rounded p-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter category name"]') as HTMLInputElement;
                  handleAddCategory(input.value);
                  input.value = '';
                }}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing Categories
            </label>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => handleRenameCategory(category, e.target.value)}
                    className="flex-1 border rounded p-2"
                  />
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}