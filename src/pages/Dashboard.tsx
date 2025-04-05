// Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { storiesService } from '../services/stories.service';
import { useStories } from '../services/stories.service';
import { useTests } from '../services/tests.service';
import { useTemplates } from '../services/templates.service';
import Card from '../components/Card';
import { useState } from 'react';
import type { Story, Template, Test } from '../services/types';

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  notTested: number;
  passRate: number;
}

export default function Dashboard() {
  const { data: stories, isLoading: isLoadingStories } = useStories();
  const { data: tests, isLoading: isLoadingTests } = useTests();
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const isLoading = isLoadingStories || isLoadingTests || isLoadingTemplates;

  // Calculate overall test statistics
  const testStats: TestStats = stories?.reduce((acc, story) => {
    const results = story.testResults.reduce((stats, result) => {
      if (result.status === 'passed') stats.passed++;
      else if (result.status === 'failed') stats.failed++;
      else stats.notTested++;
      stats.total++;
      return stats;
    }, { total: 0, passed: 0, failed: 0, notTested: 0 });

    acc.total += results.total;
    acc.passed += results.passed;
    acc.failed += results.failed;
    acc.notTested += results.notTested;
    return acc;
  }, { total: 0, passed: 0, failed: 0, notTested: 0, passRate: 0 }) || { total: 0, passed: 0, failed: 0, notTested: 0, passRate: 0 };

  if (testStats.total > 0) {
    testStats.passRate = Math.round((testStats.passed / testStats.total) * 100);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTimeframe('week')}
            className={`px-4 py-2 rounded ${
              selectedTimeframe === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setSelectedTimeframe('month')}
            className={`px-4 py-2 rounded ${
              selectedTimeframe === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setSelectedTimeframe('all')}
            className={`px-4 py-2 rounded ${
              selectedTimeframe === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-500">Total Tests</h3>
          <p className="text-3xl font-bold">{testStats.total}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-500">Passed Tests</h3>
          <p className="text-3xl font-bold text-green-600">{testStats.passed}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-500">Failed Tests</h3>
          <p className="text-3xl font-bold text-red-600">{testStats.failed}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-500">Pass Rate</h3>
          <p className="text-3xl font-bold">{testStats.passRate}%</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {stories?.slice(0, 5).map(story => {
            const results = story.testResults.reduce((acc, result) => {
              if (result.status === 'passed') acc.passed++;
              else if (result.status === 'failed') acc.failed++;
              acc.total++;
              return acc;
            }, { total: 0, passed: 0, failed: 0 });

            const passRate = results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0;

            return (
              <Card key={story.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{story.name}</h3>
                    <p className="text-sm text-gray-500">
                      {results.passed} passed, {results.failed} failed
                    </p>
                  </div>
                  <div className={`text-lg font-medium ${
                    passRate >= 80 ? 'text-green-600' :
                    passRate >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passRate}%
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
