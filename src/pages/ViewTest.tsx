import { useParams, useNavigate } from "react-router-dom";
import { useTests } from "../services/tests.service";
import type { Test } from "../services/types";

export default function ViewTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { data: tests, isLoading } = useTests();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const test = tests?.find(t => t.id === parseInt(testId || ''));
  if (!test) {
    return <div>Test not found</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Test Details</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/tests')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Tests
          </button>
          <button
            onClick={() => navigate(`/tests/${test.id}/edit`)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit Test
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.name}</h3>
          {test.notes && (
            <p className="text-gray-600">{test.notes}</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Sections</h3>
          <div className="grid gap-4">
            {(test.sections || []).map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{section.name}</h4>
                <p className="text-gray-600">{section.description}</p>
              </div>
            ))}
          </div>
        </div>

        {(test.categories || []).length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {(test.categories || []).map((category, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}