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

export default function TestList() {
  const [testEntries, setTestEntries] = useState<Test[]>([]);

  useEffect(() => {
    // Load saved tests from localStorage
    const savedTests = localStorage.getItem('tests');
    if (savedTests) {
      setTestEntries(JSON.parse(savedTests));
    }
  }, []);

  const deleteTest = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test template?')) {
      const updatedTests = testEntries.filter(test => test.id !== id);
      setTestEntries(updatedTests);
      localStorage.setItem('tests', JSON.stringify(updatedTests));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Test Templates</h2>
        <Link
          to="/tests/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Template
        </Link>
      </div>

      <div className="space-y-4">
        {testEntries.map((test) => (
          <div key={test.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{test.title}</h3>
                <p className="text-gray-600">Template: {test.template}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(test.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/tests/${test.id}/edit`}
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