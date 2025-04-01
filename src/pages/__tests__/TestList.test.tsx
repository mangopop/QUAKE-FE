import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TestList from '../TestList'
import { useTests, useDeleteTest, useCreateTest } from '../../services/tests.service'
import type { Test, Section, CreateTestRequest } from '../../services/types'
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
    owner: [],
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
    owner: [],
    templateId: "2"
  }
]

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
      data: mockTests,
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
      promise: Promise.resolve(mockTests)
    } as unknown as UseQueryResult<Test[], Error>
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
    } as unknown as UseMutationResult<void, Error, string>

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
      promise: Promise.resolve([] as Test[])
    } as unknown as UseQueryResult<Test[], Error>
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
  })

  it('filters tests based on search query', () => {
    renderTestList()

    const searchInput = screen.getByPlaceholderText('Search tests...')
    fireEvent.change(searchInput, { target: { value: 'login' } })

    // Should show Login Test but not Registration Flow
    expect(screen.getByText('Login Test')).toBeInTheDocument()
    expect(screen.queryByText('Registration Flow')).not.toBeInTheDocument()
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
    const editButtons = screen.getAllByTitle('Edit Test')
    editButtons.forEach(button => {
      expect(button).toHaveClass(
        'text-gray-500',
        'hover:text-blue-500',
        'p-2',
        'rounded-full',
        'hover:bg-blue-50',
        'transition-colors'
      )
      // Verify edit icon
      const svg = button.querySelector('svg')
      expect(svg).toHaveClass('w-5', 'h-5')
    })

    // Delete buttons
    const deleteButtons = screen.getAllByTitle('Delete Test')
    deleteButtons.forEach(button => {
      expect(button).toHaveClass(
        'text-gray-500',
        'hover:text-red-500',
        'p-2',
        'rounded-full',
        'hover:bg-red-50',
        'transition-colors'
      )
      // Verify delete icon
      const svg = button.querySelector('svg')
      expect(svg).toHaveClass('w-5', 'h-5')
    })
  })

  it('handles test deletion', async () => {
    const mockDeleteMutation = vi.fn()
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
      mutate: vi.fn(),
      mutateAsync: mockDeleteMutation,
      reset: vi.fn(),
      status: 'idle' as const,
      variables: undefined,
      submittedAt: Date.now()
    } as unknown as UseMutationResult<void, Error, string>
    vi.mocked(useDeleteTest).mockReturnValue(mockMutationResult)

    renderTestList()

    // Find and click the delete button for the first test
    const deleteButtons = screen.getAllByTitle('Delete Test')
    fireEvent.click(deleteButtons[0])

    // Verify that delete mutation was called with correct ID
    await waitFor(() => {
      expect(mockDeleteMutation).toHaveBeenCalledWith('1')
    })
  })

  it('displays correct number of sections for each test', () => {
    renderTestList()

    // Both mock tests have 2 sections
    const sectionNumbers = screen.getAllByText('2', { exact: true })
    expect(sectionNumbers).toHaveLength(2)

    const sectionLabels = screen.getAllByText('sections', { exact: true })
    expect(sectionLabels).toHaveLength(2)
  })

  it('displays correct number of categories for each test', () => {
    renderTestList()

    // Both mock tests have 0 categories for each section
    const categoryNumbers = screen.getAllByText('0', { exact: true })
    const categoryLabels = screen.getAllByText('categories', { exact: true })

    // Each test has 2 sections, and each section shows category count
    expect(categoryNumbers).toHaveLength(mockTests.length * mockTests[0].sections.length)
    expect(categoryLabels).toHaveLength(mockTests.length * mockTests[0].sections.length)
  })
})