import { useState } from "react";

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

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([
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
  ]);

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [formMode, setFormMode] = useState<TemplateFormMode>('create');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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

    if (formMode === 'create') {
      setTemplates(prev => [...prev, template]);
    } else {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
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
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const resetForm = () => {
    setNewTemplate({ name: "", description: "", category: "", sections: [] });
    setEditingTemplateId(null);
    setFormMode('create');
    setShowTemplateForm(false);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
        </div>
      </div>

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
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSection(index, 'name', e.target.value)}
                      className="flex-1 border rounded p-2"
                      placeholder="Section name"
                    />
                    <input
                      type="text"
                      value={section.description}
                      onChange={(e) => updateSection(index, 'description', e.target.value)}
                      className="flex-1 border rounded p-2"
                      placeholder="Section description"
                    />
                    <button
                      onClick={() => {
                        setNewTemplate(prev => ({
                          ...prev,
                          sections: prev.sections?.filter((_, i) => i !== index)
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
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
        {filteredTemplates.map((template) => (
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