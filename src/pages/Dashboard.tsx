// Dashboard.tsx
import { useTests } from "../services/tests.service";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import type { Test } from "../services/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: tests, isLoading } = useTests();

  const handleEdit = (test: Test) => {
    navigate(`/tests/${test.id}/edit`);
  };

  const handleDelete = (test: Test) => {
    // Handle delete
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests?.map(test => (
          <Card
            key={test.id}
            title={test.name}
            owner={test.owner}
            onEdit={() => handleEdit(test)}
            onDelete={() => handleDelete(test)}
            metadata={[
              { label: 'sections', value: test.sections?.length || 0 },
              { label: 'categories', value: test.categories?.length || 0 }
            ]}
            notes={test.notes || undefined}
            tags={test.categories?.map(category => ({
              text: typeof category === 'string' ? category : category.name
            }))}
            sections={test.sections?.map(section => ({
              name: section.name,
              description: section.description
            }))}
          />
        ))}
      </div>
    </div>
  );
}
