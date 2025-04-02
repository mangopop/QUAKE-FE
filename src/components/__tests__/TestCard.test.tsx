import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TestCard from '../TestCard'
import type { Test } from '../../services/types'

describe('TestCard', () => {
  const mockTest: Test = {
    id: 1,
    name: 'Sample Test',
    notes: 'Test notes',
    sections: [
      { name: 'Section 1', description: 'Content 1' },
      { name: 'Section 2', description: 'Content 2' },
    ],
    categories: ['UI', 'Authentication'],
    owner: {
      id: 1,
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe"
    },
    templateId: "1"
  }

  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the test name correctly', () => {
    render(<TestCard test={mockTest} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
    expect(screen.getByText('Sample Test')).toBeInTheDocument()
  })

  it('displays the number of sections', () => {
    render(<TestCard test={mockTest} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
    const sectionCount = screen.getByText((content, element) => {
      if (!element) return false
      return element.tagName.toLowerCase() === 'span' &&
             element.className.includes('text-sm text-gray-600') &&
             element.textContent?.includes('2 sections') || false
    })
    expect(sectionCount).toBeInTheDocument()
  })

  it('displays the number of categories', () => {
    render(<TestCard test={mockTest} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
    const categoryCount = screen.getByText((content, element) => {
      if (!element) return false
      return element.tagName.toLowerCase() === 'span' &&
             element.className.includes('text-sm text-gray-600') &&
             element.textContent?.includes('2 categories') || false
    })
    expect(categoryCount).toBeInTheDocument()
  })

  it('renders all sections with their names and descriptions', () => {
    render(<TestCard test={mockTest} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
    expect(screen.getByText('Section 1')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByText('Section 2')).toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('displays owner information', () => {
    render(<TestCard test={mockTest} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
    const ownerText = screen.getByText((content, element) => {
      if (!element) return false
      return element.tagName.toLowerCase() === 'p' &&
             element.className.includes('text-sm text-gray-500') &&
             element.textContent?.includes('Owner: John Doe') || false
    })
    expect(ownerText).toBeInTheDocument()
  })

  it('displays notes when provided', () => {
    render(<TestCard test={mockTest} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
    expect(screen.getByText('Test notes')).toBeInTheDocument()
  })

  it('displays categories as tags', () => {
    render(<TestCard test={mockTest} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
    expect(screen.getByText('UI')).toBeInTheDocument()
    expect(screen.getByText('Authentication')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    render(<TestCard test={mockTest} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(mockOnEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<TestCard test={mockTest} onEdit={mockOnEdit} onDelete={mockOnDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(mockOnDelete).toHaveBeenCalledTimes(1)
  })
})