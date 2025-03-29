import { useState, useEffect } from "react";
import TemplateNav from "../components/TemplateNav";
import CategoryManager from "../components/CategoryManager";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: {
    name: string;
    description: string;
  }[];
}

type TemplateFormMode = 'create' | 'edit';
type SortField = 'name' | 'category' | 'sections';
type SortOrder = 'asc' | 'desc';

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);

  // Load templates from localStorage on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('templates');
    console.log('Loading templates from localStorage:', savedTemplates);
    if (savedTemplates) {
      const parsedTemplates = JSON.parse(savedTemplates);
      console.log('Parsed templates:', parsedTemplates);
      setTemplates(parsedTemplates);
    } else {
      // Initialize with default templates if none exist
      const defaultTemplates: Template[] = [
        {
          id: "1",
          name: "Login Flow",
          description: "Standard login process testing",
          category: "Authentication",
          sections: [
            { name: "Username Input", description: "Test username validation" },
            { name: "Password Input", description: "Test password validation" },
            { name: "Login Button", description: "Test login submission" }
          ]
        },
        {
          id: "2",
          name: "Checkout Process",
          description: "E-commerce checkout flow testing",
          category: "E-commerce",
          sections: [
            { name: "Cart Summary", description: "Verify cart contents" },
            { name: "Payment Form", description: "Test payment processing" },
            { name: "Order Confirmation", description: "Verify order completion" }
          ]
        }
      ];
      console.log('Setting default templates:', defaultTemplates);
      setTemplates(defaultTemplates);
      localStorage.setItem('templates', JSON.stringify(defaultTemplates));
    }
  }, []); // Only run once on mount

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [formMode, setFormMode] = useState<TemplateFormMode>('create');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: "",
    description: "",
    category: "",
    sections: []
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const addSection = () => {
    setNewTemplate(prev => ({
      ...prev,
      sections: [...(prev.sections || []), { name: "", description: "" }]
    }));
  };

  const updateSection = (index: number, field: 'name' | 'description', value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      sections: prev.sections?.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const handleSubmit = () => {
    if (!newTemplate.name || !newTemplate.description || !newTemplate.category) return;

    const template: Template = {
      id: formMode === 'create' ? Date.now().toString() : editingTemplateId!,
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      sections: newTemplate.sections || []
    };

    console.log('Submitting template:', template);
    console.log('Current templates before update:', templates);

    if (formMode === 'create') {
      const updatedTemplates = [...templates, template];
      console.log('Updated templates after create:', updatedTemplates);
      setTemplates(updatedTemplates);
      localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    } else {
      const updatedTemplates = templates.map(t => t.id === template.id ? template : t);
      console.log('Updated templates after edit:', updatedTemplates);
      setTemplates(updatedTemplates);
      localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    }

    resetForm();
  };

  const handleEdit = (template: Template) => {
    setNewTemplate(template);
    setEditingTemplateId(template.id);
    setFormMode('edit');
    setShowTemplateForm(true);
  };

  const handleDelete = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      console.log('Updated templates after delete:', updatedTemplates);
      setTemplates(updatedTemplates);
      localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    }
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`
    };
    const updatedTemplates = [...templates, newTemplate];
    console.log('Updated templates after duplicate:', updatedTemplates);
    setTemplates(updatedTemplates);
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));
  };

  const resetForm = () => {
    setNewTemplate({ name: "", description: "", category: "", sections: [] });
    setEditingTemplateId(null);
    setFormMode('create');
    setShowTemplateForm(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const importedTemplates = JSON.parse(text);
      setTemplates(prev => [...prev, ...importedTemplates]);
    } catch (error) {
      alert('Error importing templates. Please check the file format.');
    }
  };

  const handleUpdateCategories = (newCategories: string[]) => {
    // Update templates to use new category names
    setTemplates(prev => prev.map(template => {
      const newCategory = newCategories.find(cat => cat === template.category);
      return newCategory ? template : { ...template, category: newCategories[0] };
    }));
  };

  const filteredAndSortedTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'category':
          return multiplier * a.category.localeCompare(b.category);
        case 'sections':
          return multiplier * (a.sections.length - b.sections.length);
        default:
          return 0;
      }
    });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Test Templates</h2>
        <button
          onClick={() => {
            setFormMode('create');
            resetForm();
            setShowTemplateForm(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Template
        </button>
      </div>

      <TemplateNav
        onImport={handleImport}
        onExport={handleExport}
        onManageCategories={() => setShowCategoryManager(true)}
      />

      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <label className="text-sm font-medium">Sort by:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="border rounded-md p-2"
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="sections">Number of Sections</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="border p-2 rounded"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onClose={() => setShowCategoryManager(false)}
          onUpdateCategories={handleUpdateCategories}
        />
      )}

      {showTemplateForm && (
        <div className="mb-8 p-4 border rounded-lg bg-white">
          <h3 className="text-lg font-semibold mb-4">
            {formMode === 'create' ? 'New Template' : 'Edit Template'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Template Name</label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                placeholder="Enter template name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                placeholder="Enter category"
                list="categories"
              />
              <datalist id="categories">
                {categories.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
                placeholder="Enter template description"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sections</label>
              <div className="space-y-2">
                {newTemplate.sections?.map((section, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => updateSection(index, 'name', e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="e.g., Username Input"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Section Notes</label>
                      <input
                        type="text"
                        value={section.description}
                        onChange={(e) => updateSection(index, 'description', e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="e.g., Test username validation"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setNewTemplate(prev => ({
                          ...prev,
                          sections: prev.sections?.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-500 hover:text-red-700 self-end mb-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addSection}
                className="mt-2 text-blue-500 hover:text-blue-700"
              >
                + Add Section
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {formMode === 'create' ? 'Create Template' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedTemplates.map((template) => (
          <div key={template.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {template.category}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDuplicate(template)}
                  className="text-green-500 hover:text-green-700"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{template.description}</p>
            <div className="space-y-2">
              {template.sections.map((section, index) => (
                <div key={index} className="border-t pt-2">
                  <h4 className="font-medium">{section.name}</h4>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}