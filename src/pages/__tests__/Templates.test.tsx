import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Templates from '../Templates'
import { useTemplates, useDeleteTemplate, useCreateTemplate } from '../../services/templates.service'
import type { Template } from '../../services/types'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

// Mock the services
vi.mock('../../services/templates.service', () => ({
  useTemplates: vi.fn(),
  useDeleteTemplate: vi.fn(),
  useCreateTemplate: vi.fn()
}))

// Mock template data
const mockTemplates: Template[] = [
  {
    id: 1,
    name: "Authentication Template",
    owner: [],
    tests: [
      {
        id: 1,
        name: "Login Test",
        owner: [],
        notes: "Test login functionality",
        sections: [
          { name: "Login Form", description: "Test login form validation" }
        ]
      },
      {
        id: 2,
        name: "Registration Test",
        owner: [],
        notes: "Test registration flow",
        sections: [
          { name: "Registration Form", description: "Test registration form" }
        ]
      }
    ],
    stories: []
  },
  {
    id: 2,
    name: "Payment Template",
    owner: [],
    tests: [
      {
        id: 3,
        name: "Payment Processing",
        owner: [],
        notes: "Test payment processing",
        sections: [
          { name: "Card Payment", description: "Test card payment flow" }
        ]
      }
    ],
    stories: []
  }
]

const renderTemplates = () => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Templates />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Templates Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Setup default mock implementations
    const mockQueryResult = {
      data: mockTemplates,
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
      promise: Promise.resolve(mockTemplates)
    } as unknown as UseQueryResult<Template[], Error>
    vi.mocked(useTemplates).mockReturnValue(mockQueryResult)

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
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      status: 'idle' as const,
      variables: undefined,
      submittedAt: Date.now()
    } as unknown as UseMutationResult<void, Error, string>
    vi.mocked(useDeleteTemplate).mockReturnValue(mockMutationResult)
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
      promise: Promise.resolve([] as Template[])
    } as unknown as UseQueryResult<Template[], Error>
    vi.mocked(useTemplates).mockReturnValue(loadingQueryResult)

    renderTemplates()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays list of templates', () => {
    renderTemplates()

    // Check if template names are displayed
    expect(screen.getByText('Authentication Template')).toBeInTheDocument()
    expect(screen.getByText('Payment Template')).toBeInTheDocument()

    // Check if test counts are displayed
    const testCountElements = screen.getAllByText(/tests?$/)
    expect(testCountElements).toHaveLength(2)
  })

  it('filters templates based on search query', () => {
    renderTemplates()

    const searchInput = screen.getByPlaceholderText('Search templates...')
    fireEvent.change(searchInput, { target: { value: 'auth' } })

    // Should show Authentication Template but not Payment Template
    expect(screen.getByText('Authentication Template')).toBeInTheDocument()
    expect(screen.queryByText('Payment Template')).not.toBeInTheDocument()
  })

  it('opens create template modal when clicking New Template button', () => {
    renderTemplates()

    const newTemplateButton = screen.getByText('New Template')
    fireEvent.click(newTemplateButton)

    // The modal should be rendered
    expect(screen.getByText('Create New Template')).toBeInTheDocument()
  })

  it('handles template deletion', async () => {
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
    vi.mocked(useDeleteTemplate).mockReturnValue(mockMutationResult)

    renderTemplates()

    // Find and click the delete button for the first template
    const deleteButtons = screen.getAllByTitle('Delete Template')
    fireEvent.click(deleteButtons[0])

    // Verify that delete mutation was called with correct ID
    await waitFor(() => {
      expect(mockDeleteMutation).toHaveBeenCalledWith('1')
    })
  })

  it('displays correct number of tests for each template', () => {
    renderTemplates()

    // Authentication Template has 2 tests, Payment Template has 1 test
    const testCountElements = screen.getAllByText(/tests?$/)
    expect(testCountElements).toHaveLength(2)

    const testNumbers = screen.getAllByText(/[0-9]+/, { exact: true })
    expect(testNumbers).toHaveLength(2)
    expect(testNumbers[0]).toHaveTextContent('2')
    expect(testNumbers[1]).toHaveTextContent('1')
  })

  it('renders buttons with correct styling and icons', () => {
    renderTemplates()

    // New Template button
    const newTemplateButton = screen.getByText('New Template').closest('button')
    expect(newTemplateButton).toHaveClass('bg-blue-500', 'text-white', 'px-4', 'py-2', 'rounded', 'hover:bg-blue-600', 'flex', 'items-center', 'gap-2')

    // Edit buttons
    const editButtons = screen.getAllByTitle('Edit Template')
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
    const deleteButtons = screen.getAllByTitle('Delete Template')
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
})