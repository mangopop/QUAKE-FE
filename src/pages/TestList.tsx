import { Link } from "react-router-dom";
import { useState } from "react";

interface Section {
  name: string;
  status: 'not_tested' | 'passed' | 'failed';
  notes: string;
}

interface TestEntry {
  id: string;
  title: string;
  template: string;
  sections: Section[];
  createdAt: string;
}

type StatusFilter = 'all' | 'not_tested' | 'passed' | 'failed';
type SortField = 'date' | 'title' | 'status';
type SortOrder = 'asc' | 'desc';

export default function TestList() {
  const [testEntries, setTestEntries] = useState<TestEntry[]>([
    {
      id: "1",
      title: "Login Flow Test",
      template: "Login Flow",
      sections: [
        { name: "Username Input", status: 'passed', notes: "Validates correctly" },
        { name: "Password Input", status: 'passed', notes: "Password strength indicator not showing" }
      ],
      createdAt: "2024-03-20T10:00:00Z"
    },
    {
      id: "2",
      title: "Checkout Process",
      template: "E-commerce Flow",
      sections: [
        { name: "Cart Summary", status: 'passed', notes: "All items display correctly" },
        { name: "Payment Form", status: 'not_tested', notes: "Need to test all card types" },
        { name: "Order Confirmation", status: 'passed', notes: "Email sends successfully" }
      ],
      createdAt: "2024-03-19T15:30:00Z"
    },
    {
      id: "3",
      title: "User Registration",
      template: "Account Management",
      sections: [
        { name: "Email Verification", status: 'failed', notes: "Verification link expired too quickly" },
        { name: "Profile Setup", status: 'passed', notes: "All fields save correctly" },
        { name: "Welcome Email", status: 'passed', notes: "Content and formatting verified" }
      ],
      createdAt: "2024-03-21T09:15:00Z"
    },
    {
      id: "4",
      title: "Product Search",
      template: "Search functionality",
      sections: [
        { name: "Search Results", status: 'passed', notes: "Pagination working" },
        { name: "Filters", status: 'failed', notes: "Price range filter not responding" },
        { name: "Sort Options", status: 'not_tested', notes: "Need to verify all sort orders" }
      ],
      createdAt: "2024-03-18T11:45:00Z"
    }
  ]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());

  const updateSectionStatus = (testId: string, sectionIndex: number, newStatus: 'not_tested' | 'passed' | 'failed') => {
    setTestEntries(entries =>
      entries.map(test =>
        test.id === testId
          ? {
              ...test,
              sections: test.sections.map((section, idx) =>
                idx === sectionIndex ? { ...section, status: newStatus } : section
              )
            }
          : test
      )
    );
  };

  const bulkUpdateStatus = (newStatus: 'not_tested' | 'passed' | 'failed') => {
    setTestEntries(entries =>
      entries.map(test =>
        selectedTests.has(test.id)
          ? {
              ...test,
              sections: test.sections.map(section => ({ ...section, status: newStatus }))
            }
          : test
      )
    );
    setSelectedTests(new Set());
  };

  const toggleTestSelection = (testId: string) => {
    setSelectedTests(prev => {
      const next = new Set(prev);
      if (next.has(testId)) {
        next.delete(testId);
      } else {
        next.add(testId);
      }
      return next;
    });
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

  const getStatusIcon = (status: Section['status']) => {
    switch (status) {
      case 'passed':
        return '✓';
      case 'failed':
        return '✗';
      default:
        return '?';
    }
  };

  const getTestStatus = (test: TestEntry): Section['status'] => {
    const statuses = test.sections.map(s => s.status);
    if (statuses.some(s => s === 'failed')) return 'failed';
    if (statuses.every(s => s === 'passed')) return 'passed';
    return 'not_tested';
  };

  const filteredAndSortedTests = testEntries
    .filter(test => {
      if (statusFilter === 'all') return true;
      return getTestStatus(test) === statusFilter;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'date':
          return multiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'title':
          return multiplier * a.title.localeCompare(b.title);
        case 'status':
          return multiplier * (getTestStatus(a).localeCompare(getTestStatus(b)));
        default:
          return 0;
      }
    });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Test Entries</h2>
        <Link
          to="/tests/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Test
        </Link>
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border p-1 rounded"
          >
            <option value="all">All</option>
            <option value="not_tested">Not Tested</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort by:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="border p-1 rounded"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="border p-1 rounded"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {selectedTests.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedTests.size} test{selectedTests.size !== 1 ? 's' : ''} selected
            </span>
            <select
              onChange={(e) => bulkUpdateStatus(e.target.value as Section['status'])}
              className="border p-1 rounded"
            >
              <option value="">Update status to...</option>
              <option value="not_tested">Not Tested</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredAndSortedTests.map((test) => (
          <div key={test.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTests.has(test.id)}
                  onChange={() => toggleTestSelection(test.id)}
                  className="rounded"
                />
                <div>
                  <h3 className="text-lg font-semibold">{test.title}</h3>
                  <p className="text-gray-600">Template: {test.template}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(test.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {test.sections.filter(s => s.status === 'passed').length}/{test.sections.length} sections passed
                </p>
                <span className={`text-sm ${getStatusColor(getTestStatus(test))}`}>
                  {getStatusIcon(getTestStatus(test))} {getTestStatus(test).replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {test.sections.map((section, index) => (
                <div key={index} className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{section.name}</span>
                      <span className={getStatusColor(section.status)}>
                        {getStatusIcon(section.status)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={section.status}
                        onChange={(e) => updateSectionStatus(test.id, index, e.target.value as Section['status'])}
                        className="border p-1 rounded text-sm"
                      >
                        <option value="not_tested">Not Tested</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                  {section.notes && (
                    <p className="text-sm text-gray-600 mt-1">{section.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}