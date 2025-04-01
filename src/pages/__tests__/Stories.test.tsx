import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Stories from '../Stories'
import { useStories, useDeleteStory, useCreateStory } from '../../services/stories.service'
import type { Story } from '../../services/types'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

// Mock the services
vi.mock('../../services/stories.service', () => ({
  useStories: vi.fn(() => ({
    data: mockStories,
    isLoading: false,
    error: null,
  })),
  useDeleteStory: vi.fn(() => ({
    mutate: mockDeleteStory,
    mutateAsync: mockDeleteStory,
    isPending: false,
  })),
  useCreateStory: vi.fn(() => ({
    mutate: mockCreateStory,
    mutateAsync: mockCreateStory,
    isPending: false,
  })),
  useTemplates: vi.fn(() => ({
    data: [
      { id: 1, name: "Login Template", testCount: 2 },
      { id: 2, name: "Payment Template", testCount: 1 }
    ],
    isLoading: false,
    error: null,
  })),
  storiesService: {
    getTestsByTemplate: vi.fn((templateId: number) => {
      const testCounts: Record<number, Array<{ id: number }>> = {
        1: [{ id: 1 }, { id: 2 }], // 2 tests for template 1
        2: [{ id: 3 }], // 1 test for template 2
      };
      return Promise.resolve(testCounts[templateId] || []);
    }),
  }
}))

// Mock story data
const mockStories = [
  {
    id: 1,
    name: "Authentication Flow",
    owner: { id: 1, firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
    templates: [{ id: 1, name: "Login Template" }],
  },
  {
    id: 2,
    name: "Payment Flow",
    owner: { id: 2, firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com" },
    templates: [{ id: 2, name: "Payment Template" }],
  },
];

const mockDeleteStory = vi.fn();
const mockCreateStory = vi.fn();

const renderStories = async () => {
  const queryClient = new QueryClient()
  await act(async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Stories />
        </BrowserRouter>
      </QueryClientProvider>
    );
  });
}

describe('Stories Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Mock window.location
    const location = new URL('http://localhost');
    Object.defineProperty(window, 'location', {
      value: location,
      writable: true
    });

    // Setup default mock implementations
    const mockQueryResult = {
      data: mockStories,
      dataUpdatedAt: Date.now(),
      error: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle' as const,
      isError: false,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isSuccess: true,
      isInitialLoading: false,
      refetch: vi.fn(),
      status: 'success' as const,
      remove: vi.fn(),
      fetchNextPage: vi.fn(),
      fetchPreviousPage: vi.fn(),
      hasNextPage: false,
      hasPreviousPage: false,
      isFetchingNextPage: false,
      isFetchingPreviousPage: false,
      promise: Promise.resolve(mockStories)
    } as unknown as UseQueryResult<Story[], Error>
    vi.mocked(useStories).mockReturnValue(mockQueryResult)

    const mockMutationResult = {
      context: undefined,
      data: undefined,
      error: null,
      failureCount: 0,
      failureReason: null,
      isPending: false,
      isError: false,
      isIdle: true,
      isPaused: false,
      isSuccess: false,
      mutate: mockDeleteStory,
      mutateAsync: mockDeleteStory,
      reset: vi.fn(),
      status: 'idle' as const,
      variables: undefined,
      submittedAt: Date.now()
    } as unknown as UseMutationResult<void, Error, string>
    vi.mocked(useDeleteStory).mockReturnValue(mockMutationResult)

    // Mock useCreateStory
    const mockCreateStoryResult = {
      context: undefined,
      data: undefined,
      error: null,
      failureCount: 0,
      failureReason: null,
      isPending: false,
      isError: false,
      isIdle: true,
      isPaused: false,
      isSuccess: false,
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      status: 'idle' as const,
      variables: undefined,
      submittedAt: Date.now()
    } as unknown as UseMutationResult<Story, Error, { name: string; templateIds: number[] }>
    vi.mocked(useCreateStory).mockReturnValue(mockCreateStoryResult)
  })

  it('displays loading state', async () => {
    vi.mocked(useStories).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    await renderStories();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  })

  it('displays list of stories', async () => {
    await renderStories();
    expect(screen.getByText("Authentication Flow")).toBeInTheDocument();
    expect(screen.getByText("Payment Flow")).toBeInTheDocument();
  })

  it('filters stories based on search query', async () => {
    await renderStories();

    const searchInput = screen.getByPlaceholderText("Search stories...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "Authentication" } });
    });

    expect(screen.getByText("Authentication Flow")).toBeInTheDocument();
    expect(screen.queryByText("Payment Flow")).not.toBeInTheDocument();
  })

  it('opens create story modal when clicking New Story button', async () => {
    await renderStories();

    await act(async () => {
      fireEvent.click(screen.getByText("New Story"));
    });

    expect(screen.getByText("Create New Story")).toBeInTheDocument();
  })

  it('handles story deletion', async () => {
    await renderStories();

    const deleteButtons = screen.getAllByTitle("Delete Story");
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(mockDeleteStory).toHaveBeenCalledWith("1");
    });
  })

  it('displays correct number of tests for each template', async () => {
    await renderStories();

    await waitFor(() => {
      const testNumbers = screen.getAllByText(/[0-9]+/, { exact: true });
      expect(testNumbers).toHaveLength(2);
      expect(testNumbers[0]).toHaveTextContent("2");
      expect(testNumbers[1]).toHaveTextContent("1");
    });
  })

  it('renders buttons with correct styling and icons', async () => {
    await renderStories();

    const editButtons = screen.getAllByTitle("Edit Story");
    const deleteButtons = screen.getAllByTitle("Delete Story");
    const runButtons = screen.getAllByText("Run");

    expect(editButtons[0]).toHaveClass("text-gray-500", "hover:text-blue-500");
    expect(deleteButtons[0]).toHaveClass("text-gray-500", "hover:text-red-500");
    expect(runButtons[0]).toHaveClass("bg-green-500", "hover:bg-green-600");
  })
})