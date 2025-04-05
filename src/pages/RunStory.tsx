import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  useStory,
  useUpdateTestResult,
  useUpdateSectionResult,
  useSectionResults,
  useAddSectionNote,
  storiesService
} from "../services/stories.service";
import type { Test, SectionResult, Section } from "../services/types";
import { useQueryClient } from "@tanstack/react-query";
import BackButton from '../components/common/BackButton';
import TestCard from '../components/common/TestCard';
import StatusHeader from '../components/common/StatusHeader';

type TestStatus = "not_tested" | "passed" | "failed";

interface TestNotes {
  id: number;
  note: string;
  createdAt: string;
  createdBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface TestResult {
  id: number;
  status: TestStatus;
  notes: TestNotes[];
  sectionResults: SectionResult[];
  test: {
    id: number;
    name: string;
    owner: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    };
    notes: string | null;
    categories: any[][];
    sections: Section[];
    createdAt: string;
  };
}

export default function RunStory() {
  const { storyId } = useParams<{ storyId: string }>();
  const { data: story, isLoading: isLoadingStory } = useStory(storyId || "");
  const updateTestResult = useUpdateTestResult();
  const updateSectionResult = useUpdateSectionResult();
  const { data: sectionResultsData } = useSectionResults(storyId || "");
  const addSectionNote = useAddSectionNote();
  const [testStatuses, setTestStatuses] = useState<Record<number, TestStatus>>({});
  const [uniqueTests, setUniqueTests] = useState<Test[]>([]);
  const [totalTests, setTotalTests] = useState(0);
  const [sectionResults, setSectionResults] = useState<Record<number, SectionResult>>({});
  const queryClient = useQueryClient();

  const INITIAL_NOTES_SHOWN = 2;
  const MAX_LINES_BEFORE_COLLAPSE = 20;

  // Fetch tests for all templates and deduplicate them
  useEffect(() => {
    const fetchAllTests = async () => {
      if (!story?.templates) return;

      try {
        const testPromises = story.templates.map(template =>
          storiesService.getTestsByTemplate(template.id)
        );

        const testResults = await Promise.all(testPromises);
        const allTests = testResults.flat();
        setTotalTests(allTests.length);

        // Deduplicate tests by ID
        const uniqueTestsMap = new Map<number, Test>();
        allTests.forEach((test: Test) => {
          if (!uniqueTestsMap.has(test.id)) {
            uniqueTestsMap.set(test.id, test);
          }
        });

        setUniqueTests(Array.from(uniqueTestsMap.values()));
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    fetchAllTests();
  }, [story?.templates]);

  // Initialize test statuses from story test results
  useEffect(() => {
    if (story?.testResults) {
      const initialStatuses: Record<number, TestStatus> = {};
      const testResults = story.testResults as unknown as TestResult[];

      // First, set all tests to "not_tested"
      uniqueTests.forEach(test => {
        initialStatuses[test.id] = "not_tested";
      });

      // Then update with any existing test results
      testResults.forEach((result) => {
        initialStatuses[result.test.id] = result.status;
      });

      setTestStatuses(initialStatuses);
    } else {
      // If no test results, set all tests to "not_tested"
      const initialStatuses: Record<number, TestStatus> = {};
      uniqueTests.forEach(test => {
        initialStatuses[test.id] = "not_tested";
      });
      setTestStatuses(initialStatuses);
    }
  }, [story, uniqueTests]);

  // Initialize section results from API
  useEffect(() => {
    if (sectionResultsData?.section_results) {
      const initialSectionResults: Record<number, SectionResult> = {};
      sectionResultsData.section_results.forEach((result) => {
        initialSectionResults[result.section.id] = result;
      });
      setSectionResults(initialSectionResults);
    } else {
      // If no section results, initialize all sections as "not_tested"
      const initialSectionResults: Record<number, SectionResult> = {};
      uniqueTests.forEach(test => {
        test.sections.forEach(section => {
          initialSectionResults[section.id] = {
            id: 0,
            status: "not_tested",
            section: {
              id: section.id,
              name: section.name,
              description: section.description
            },
            updatedAt: new Date().toISOString(),
            notes: []
          };
        });
      });
      setSectionResults(initialSectionResults);
    }
  }, [sectionResultsData, uniqueTests]);

  const handleStatusChange = async (testId: number, status: TestStatus) => {
    if (!storyId) return;

    // Update local state
    const newTestStatuses = {
      ...testStatuses,
      [testId]: status
    };
    setTestStatuses(newTestStatuses);

    try {
      // Save to API
      await updateTestResult.mutateAsync({
        storyId,
        testId,
        data: {
          status,
          notes: null
        }
      });
    } catch (error) {
      console.error('Failed to update test status:', error);
    }
  };

  const handleSectionStatusChange = async (testId: number, sectionId: number, status: "not_tested" | "passed" | "failed") => {
    if (!storyId) return;

    try {
      const updatedResult = await updateSectionResult.mutateAsync({
        storyId,
        sectionId,
        data: { status }
      });

      // Update local state with the new result
      setSectionResults(prev => ({
        ...prev,
        [sectionId]: updatedResult
      }));

      // The backend will handle updating the test status based on section results
      // We can refetch the story data to get the updated test status
      await queryClient.invalidateQueries({ queryKey: ['story', storyId] });
    } catch (error) {
      console.error('Failed to update section status:', error);
    }
  };

  const handleSaveNotes = async (testId: number, note: string) => {
    if (!storyId || !note.trim()) return;

    try {
      await updateTestResult.mutateAsync({
        storyId,
        testId,
        data: {
          status: testStatuses[testId] || "not_tested",
          notes: note
        }
      });
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleSaveSectionNotes = async (testId: number, sectionId: number, note: string) => {
    if (!storyId || !note.trim()) return;

    try {
      await addSectionNote.mutateAsync({
        storyId,
        sectionId,
        data: { note }
      });
    } catch (error) {
      console.error('Failed to save section notes:', error);
    }
  };

  if (isLoadingStory) {
    return <div className="p-4">Loading story details...</div>;
  }

  if (!story) {
    return <div>Story not found</div>;
  }

  if (!story.templates || story.templates.length === 0) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Run Story: {story.name}</h2>
            <BackButton />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">No templates found for this story. Please add templates before running tests.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <StatusHeader
          title={`Run Story: ${story.name}`}
          totalTests={totalTests}
          uniqueTests={uniqueTests.length}
        />

        <div className="space-y-4">
          {uniqueTests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              status={testStatuses[test.id]}
              onStatusChange={(status) => handleStatusChange(test.id, status)}
              onSaveNote={(note) => handleSaveNotes(test.id, note)}
              sectionResults={sectionResults}
              onSectionStatusChange={handleSectionStatusChange}
              onSaveSectionNote={handleSaveSectionNotes}
              notes={(() => {
                const testResult = story?.testResults?.find(r => r.test.id === test.id) as TestResult | undefined;
                return testResult?.notes || [];
              })()}
              initialNotesShown={INITIAL_NOTES_SHOWN}
              maxLinesBeforeCollapse={MAX_LINES_BEFORE_COLLAPSE}
            />
          ))}
        </div>
      </div>
    </div>
  );
}