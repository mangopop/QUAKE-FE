import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Section {
  name: string;
  status: 'not_tested' | 'passed' | 'failed';
  notes: string;
}

interface Test {
  id: string;
  title: string;
  template: string;
  sections: Section[];
  createdAt: string;
}

export default function RunTest() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);

  // Load test from localStorage on component mount
  useEffect(() => {
    const savedTests = JSON.parse(localStorage.getItem('tests') || '[]');
    const foundTest = savedTests.find((t: Test) => t.id === testId);
    if (foundTest) {
      setTest(foundTest);
    } else {
      navigate('/tests');
    }
  }, [testId, navigate]);

  const updateSection = (index: number, key: keyof Section, value: string | 'not_tested' | 'passed' | 'failed') => {
    if (!test) return;
    const newSections = test.sections.map((section, i) =>
      i === index ? { ...section, [key]: value } : section
    );
    setTest({ ...test, sections: newSections });
  };

  const handleSubmit = () => {
    if (!test) return;

    // Get existing tests from localStorage
    const existingTests = JSON.parse(localStorage.getItem('tests') || '[]');

    // Update the tests array with the updated test
    const updatedTests = existingTests.map((t: Test) => {
      if (t.id === test.id) {
        return test;
      }
      return t;
    });

    // Save the updated tests back to localStorage
    localStorage.setItem('tests', JSON.stringify(updatedTests));

    // Navigate back to the previous page
    navigate(-1);
  };

  const getStatusColor = (status: Section['status']) => {
    switch (status) {
      case 'passed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!test) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Run Test: {test.title}</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Test Details</h3>
              <p className="text-gray-600">Template: {test.template}</p>
              <p className="text-sm text-gray-500">
                Created: {new Date(test.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Test Sections</h3>
              <div className="space-y-4">
                {test.sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{section.name}</span>
                      <span className={`${getStatusColor(section.status)}`}>
                        {section.status === 'passed' ? '✓' : section.status === 'failed' ? '✗' : '?'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSection(index, 'status', 'passed')}
                          className={`px-3 py-1 rounded ${
                            section.status === 'passed'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => updateSection(index, 'status', 'failed')}
                          className={`px-3 py-1 rounded ${
                            section.status === 'failed'
                              ? 'bg-red-500 text-white'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          Fail
                        </button>
                      </div>
                      <textarea
                        value={section.notes}
                        onChange={(e) => updateSection(index, 'notes', e.target.value)}
                        placeholder="Add notes about this section..."
                        className="w-full border rounded p-2 text-sm"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}