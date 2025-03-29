import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface Section {
  name: string;
  description: string;
}

interface Test {
  id: string;
  title: string;
  template: string;
  sections: Section[];
  createdAt: string;
}

type SortField = 'title' | 'template' | 'sections';
type SortOrder = 'asc' | 'desc';

export default function TestList() {
  const [testEntries, setTestEntries] = useState<Test[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    // Load saved tests from localStorage
    const savedTests = localStorage.getItem('tests');
    if (savedTests) {
      setTestEntries(JSON.parse(savedTests));
    }
  }, []);

  const deleteTest = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      const updatedTests = testEntries.filter(test => test.id !== id);
      setTestEntries(updatedTests);
      localStorage.setItem('tests', JSON.stringify(updatedTests));
    }
  };

  // Get unique templates for filter dropdown
  const templates = Array.from(new Set(testEntries.map(test => test.template)));

  // Filter and sort tests
  const filteredAndSortedTests = testEntries
    .filter(test => {
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           test.template.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTemplate = selectedTemplate === "all" || test.template === selectedTemplate;
      return matchesSearch && matchesTemplate;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'title':
          return multiplier * a.title.localeCompare(b.title);
        case 'template':
          return multiplier * a.template.localeCompare(b.template);
        case 'sections':
          return multiplier * (a.sections.length - b.sections.length);
        default:
          return 0;
      }
    });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Tests</h2>
        <Link
          to="/tests/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Test
        </Link>
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Template:</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="all">All Templates</option>
            {templates.map(template => (
              <option key={template} value={template}>{template}</option>
            ))}
          </select>
          <label className="text-sm font-medium">Sort by:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="border rounded-md p-2"
          >
            <option value="title">Title</option>
            <option value="template">Template</option>
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

      <div className="space-y-4">
        {filteredAndSortedTests.map((test) => (
          <div key={test.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{test.title}</h3>
                <p className="text-gray-600">Type: {test.template}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(test.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/templates`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteTest(test.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Sections</h4>
              {test.sections.map((section, index) => (
                <div key={index} className="border-t pt-2">
                  <div className="font-medium">{section.name}</div>
                  <p className="text-gray-600">{section.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}