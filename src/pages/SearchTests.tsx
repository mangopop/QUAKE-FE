import { useState } from 'react';
import { useTests } from '../services/tests.service';
import Card from '../components/Card';
import type { Test } from '../services/types';

export default function SearchTests() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: tests, isLoading } = useTests();

  const filteredTests = tests?.data.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map(test => (
          <Card
            key={test.id}
            title={test.name}
            description={test.description}
            owner={test.owner}
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