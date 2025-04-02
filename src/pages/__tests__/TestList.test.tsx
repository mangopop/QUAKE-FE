import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TestList from '../TestList'
import { useTests, useDeleteTest, useCreateTest } from '../../services/tests.service'
import type { Test, PaginatedTestsResponse } from '../../services/types'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

// Mock the services
vi.mock('../../services/tests.service', () => ({
  useTests: vi.fn(),
  useDeleteTest: vi.fn(),
  useCreateTest: vi.fn(),
}))

// Mock test data
const mockTests: Test[] = [
  {
    id: 1,
    name: "Login Test",
    notes: "Test login functionality",
    sections: [
      { name: "Login Form", description: "Test login form validation" },
      { name: "Error Messages", description: "Verify error messages" }
    ],
    categories: ["Authentication", "UI"],
    owner: {
      id: 1,
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe"
    },
    templateId: "1"
  },
  {
    id: 2,
    name: "Registration Flow",
    notes: "Test registration process",
    sections: [
      { name: "Registration Form", description: "Test registration form" },
      { name: "Success Message", description: "Verify success message" }
    ],
    categories: ["Authentication"],
    owner: {
      id: 2,
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith"
    },
    templateId: "2"
  }
]

const mockPaginatedResponse: PaginatedTestsResponse = {
  data: mockTests,
  total: mockTests.length,
  totalPages: 2,
  page: 1,
  limit: 30
}

const renderTestList = () => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TestList />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('TestList Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Setup default mock implementations
    const mockQueryResult = {
      data: mockPaginatedResponse,
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
      isStale: false,
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
      promise: Promise.resolve(mockPaginatedResponse)
    } as unknown as UseQueryResult<PaginatedTestsResponse, Error>
    vi.mocked(useTests).mockReturnValue(mockQueryResult)

    const mockDeleteMutationResult = {
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
    } as unknown as UseMutationResult<void, Error, number>

    vi.mocked(useDeleteTest).mockReturnValue(mockDeleteMutationResult)
  })

  it('displays loading state', () => {
    const loadingQueryResult = {
      data: undefined,
      dataUpdatedAt: 0,
      error: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'fetching' as const,
      isError: false,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: true,
      isLoading: true,
      isLoadingError: false,
      isPaused: false,
      isPending: true,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isSuccess: false,
      isInitialLoading: true,
      refetch: vi.fn(),
      status: 'pending' as const,
      remove: vi.fn(),
      fetchNextPage: vi.fn(),
      fetchPreviousPage: vi.fn(),
      hasNextPage: false,
      hasPreviousPage: false,
      isFetchingNextPage: false,
      isFetchingPreviousPage: false,
      promise: Promise.resolve(mockPaginatedResponse)
    } as unknown as UseQueryResult<PaginatedTestsResponse, Error>
    vi.mocked(useTests).mockReturnValue(loadingQueryResult)

    renderTestList()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays list of tests', () => {
    renderTestList()

    // Check if test names are displayed
    expect(screen.getByText('Login Test')).toBeInTheDocument()
    expect(screen.getByText('Registration Flow')).toBeInTheDocument()

    // Check if notes are displayed
    expect(screen.getByText('Test login functionality')).toBeInTheDocument()
    expect(screen.getByText('Test registration process')).toBeInTheDocument()

    // Check if owner information is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('filters tests based on search query', async () => {
    const mockFilteredResponse: PaginatedTestsResponse = {
      data: [mockTests[0]], // Only return Login Test
      total: 1,
      totalPages: 1,
      page: 1,
      limit: 30
    }

    const mockQueryResult = {
      data: mockFilteredResponse,
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
      isStale: false,
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
      promise: Promise.resolve(mockFilteredResponse)
    } as unknown as UseQueryResult<PaginatedTestsResponse, Error>
    vi.mocked(useTests).mockReturnValue(mockQueryResult)

    renderTestList()
    const searchInput = screen.getByPlaceholderText('Search tests...')
    fireEvent.change(searchInput, { target: { value: 'Login' } })

    await waitFor(() => {
      expect(screen.getByText('Login Test')).toBeInTheDocument()
      expect(screen.queryByText('Registration Flow')).not.toBeInTheDocument()
    })
  })

  it('filters tests by category', async () => {
    const mockFilteredResponse: PaginatedTestsResponse = {
      data: [mockTests[0]], // Only return Login Test
      total: 1,
      totalPages: 1,
      page: 1,
      limit: 30
    }

    const mockQueryResult = {
      data: mockFilteredResponse,
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
      isStale: false,
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
      promise: Promise.resolve(mockFilteredResponse)
    } as unknown as UseQueryResult<PaginatedTestsResponse, Error>
    vi.mocked(useTests).mockReturnValue(mockQueryResult)

    renderTestList()
    const categorySelect = screen.getByRole('combobox', { name: /category/i })
    fireEvent.change(categorySelect, { target: { value: 'Authentication' } })

    await waitFor(() => {
      expect(screen.getByText('Login Test')).toBeInTheDocument()
      expect(screen.queryByText('Registration Flow')).not.toBeInTheDocument()
    })
  })

  it('filters tests by owner', async () => {
    const mockFilteredResponse: PaginatedTestsResponse = {
      data: [mockTests[0]], // Only return Login Test
      total: 1,
      totalPages: 1,
      page: 1,
      limit: 30
    }

    const mockQueryResult = {
      data: mockFilteredResponse,
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
      isStale: false,
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
      promise: Promise.resolve(mockFilteredResponse)
    } as unknown as UseQueryResult<PaginatedTestsResponse, Error>
    vi.mocked(useTests).mockReturnValue(mockQueryResult)

    renderTestList()
    const ownerSelect = screen.getByRole('combobox', { name: /owner/i })
    fireEvent.change(ownerSelect, { target: { value: '1' } })

    await waitFor(() => {
      expect(screen.getByText('Login Test')).toBeInTheDocument()
      expect(screen.queryByText('Registration Flow')).not.toBeInTheDocument()
    })
  })

  it('displays no results message when no tests are found', () => {
    const emptyResponse: PaginatedTestsResponse = {
      data: [],
      total: 0,
      totalPages: 1,
      page: 1,
      limit: 30
    }

    const mockQueryResult = {
      data: emptyResponse,
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
      isStale: false,
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
      promise: Promise.resolve(emptyResponse)
    } as unknown as UseQueryResult<PaginatedTestsResponse, Error>
    vi.mocked(useTests).mockReturnValue(mockQueryResult)

    renderTestList()
    expect(screen.getByText('No tests found')).toBeInTheDocument()
  })

  it('handles pagination', () => {
    const mockPaginatedResponse: PaginatedTestsResponse = {
      data: Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Test ${i + 1}`,
        notes: `Test notes ${i + 1}`,
        sections: [
          { name: 'Section 1', description: 'Description 1' },
          { name: 'Section 2', description: 'Description 2' }
        ],
        categories: ['Authentication'],
        owner: {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe'
        },
        templateId: "1"
      })),
      total: 15,
      totalPages: 2,
      page: 1,
      limit: 10
    }

    const mockQueryResult = {
      data: mockPaginatedResponse,
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
      isStale: false,
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
      promise: Promise.resolve(mockPaginatedResponse)
    } as unknown as UseQueryResult<PaginatedTestsResponse, Error>
    vi.mocked(useTests).mockReturnValue(mockQueryResult)

    renderTestList()

    // Check if pagination elements are present
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()

    // Check if pagination buttons work
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
  })

  it('handles test deletion', async () => {
    const mockDeleteMutation = vi.mocked(useDeleteTest)()
    mockDeleteMutation.mutateAsync = vi.fn().mockResolvedValue(undefined)

    renderTestList()
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith(1)
    })
  })
})