import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TestList from '../TestList'
import { useTests, useDeleteTest, useCreateTest } from '../../services/tests.service'
import type { Test, Section, CreateTestRequest, PaginatedTestsResponse } from '../../services/types'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

// Mock the services
vi.mock('../../services/tests.service', () => ({
  useTests: vi.fn(),
  useDeleteTest: vi.fn(),
  useCreateTest: vi.fn()
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
    categories: [],
    owner: {
      id: 1,
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe"
    },
    templateId: "1"
  },
  {
    id: 2,
    name: "Registration Flow",
    notes: "Test user registration",
    sections: [
      { name: "Registration Form", description: "Test registration form" },
      { name: "Email Verification", description: "Test email verification" }
    ],
    categories: [],
    owner: {
      id: 2,
      email: "test2@example.com",
      firstName: "Jane",
      lastName: "Smith"
    },
    templateId: "2"
  }
]

const mockPaginatedResponse: PaginatedTestsResponse = {
  data: mockTests,
  total: mockTests.length,
  totalPages: 1,
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

    const mockCreateMutationResult = {
      context: undefined,
      data: mockTests[0],
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
    } as unknown as UseMutationResult<Test, Error, CreateTestRequest>

    vi.mocked(useDeleteTest).mockReturnValue(mockDeleteMutationResult)
    vi.mocked(useCreateTest).mockReturnValue(mockCreateMutationResult)
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
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays list of tests', () => {
    renderTestList()

    // Check if test names are displayed
    expect(screen.getByText('Login Test')).toBeInTheDocument()
    expect(screen.getByText('Registration Flow')).toBeInTheDocument()

    // Check if notes are displayed
    expect(screen.getByText('Test login functionality')).toBeInTheDocument()
    expect(screen.getByText('Test user registration')).toBeInTheDocument()

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
    fireEvent.change(searchInput, { target: { value: 'login' } })

    // Wait for the filtered results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Login Test')).toBeInTheDocument()
      expect(screen.queryByText('Registration Flow')).not.toBeInTheDocument()
    })
  })

  it('opens create test modal when clicking New Test button', () => {
    renderTestList()

    const newTestButton = screen.getByText('New Test')
    fireEvent.click(newTestButton)

    // The modal should be rendered
    expect(screen.getByText('Create New Test')).toBeInTheDocument()
  })

  it('displays test sections', () => {
    renderTestList()

    // Check if section names and descriptions are displayed
    expect(screen.getByText('Login Form')).toBeInTheDocument()
    expect(screen.getByText('Test login form validation')).toBeInTheDocument()
    expect(screen.getByText('Error Messages')).toBeInTheDocument()
    expect(screen.getByText('Verify error messages')).toBeInTheDocument()
  })

  it('renders buttons with correct styling and icons', () => {
    renderTestList()

    // New Test button
    const newTestButton = screen.getByText('New Test').closest('button')
    expect(newTestButton).toHaveClass('bg-blue-500', 'text-white', 'px-4', 'py-2', 'rounded', 'hover:bg-blue-600', 'flex', 'items-center', 'gap-2')

    // Edit buttons
    const editButtons = screen.getAllByTitle('Edit')
    editButtons.forEach(button => {
      expect(button).toHaveClass(
        'text-gray-500',
        'hover:text-blue-500',
        'p-2',
        'rounded-full',
        'hover:bg-blue-50',
        'transition-colors'
      )
    })

    // Delete buttons
    const deleteButtons = screen.getAllByTitle('Delete')
    deleteButtons.forEach(button => {
      expect(button).toHaveClass(
        'text-gray-500',
        'hover:text-red-500',
        'p-2',
        'rounded-full',
        'hover:bg-red-50',
        'transition-colors'
      )
    })
  })

  it('displays pagination controls when there are multiple pages', () => {
    const mockPaginatedResponseWithPages: PaginatedTestsResponse = {
      data: mockTests,
      total: 60,
      totalPages: 2,
      page: 1,
      limit: 30
    }

    const mockQueryResult = {
      data: mockPaginatedResponseWithPages,
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
      promise: Promise.resolve(mockPaginatedResponseWithPages)
    } as unknown as UseQueryResult<PaginatedTestsResponse, Error>

    vi.mocked(useTests).mockReturnValue(mockQueryResult)

    renderTestList()

    // Check if pagination controls are displayed
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })
})