import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TestCard from '../TestCard'
import type { Owner } from '../../services/types'

interface Section {
  title: string;
  content: string;
}

// Mock the Section component since it's a dependency
vi.mock('../Section', () => ({
  default: ({ section, index }: { section: Section; index: number }) => (
    <div data-testid="mock-section" data-index={index}>
      {section.title}
    </div>
  ),
}))

describe('TestCard', () => {
  const mockTest = {
    id: 1,
    name: 'Sample Test',
    template: 'Basic Template',
    sections: [
      { name: 'Section 1', description: 'Content 1' },
      { name: 'Section 2', description: 'Content 2' },
    ],
    notes: 'Test notes',
    categories: ['UI', 'Authentication'],
    owner: {
      id: 1,
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe"
    } as Owner,
    templateId: "1"
  }

  it('renders the test name correctly', () => {
    render(<TestCard test={mockTest} />)
    expect(screen.getByText('Sample Test')).toBeInTheDocument()
  })

  it('displays the template name', () => {
    render(<TestCard test={mockTest} />)
    expect(screen.getByText('Template: Basic Template')).toBeInTheDocument()
  })

  it('renders all sections', () => {
    render(<TestCard test={mockTest} />)
    const sections = screen.getAllByTestId('mock-section')
    expect(sections).toHaveLength(2)
  })

  it('displays "None" when no template is provided', () => {
    const testWithoutTemplate = {
      ...mockTest,
      template: undefined,
    }
    render(<TestCard test={testWithoutTemplate} />)
    expect(screen.getByText('Template: None')).toBeInTheDocument()
  })

  it('displays owner information', () => {
    render(<TestCard test={mockTest} />)
    expect(screen.getByText('Owner: John Doe')).toBeInTheDocument()
  })

  it('displays notes when provided', () => {
    render(<TestCard test={mockTest} />)
    expect(screen.getByText('Test notes')).toBeInTheDocument()
  })

  it('displays categories when provided', () => {
    render(<TestCard test={mockTest} />)
    expect(screen.getByText('UI')).toBeInTheDocument()
    expect(screen.getByText('Authentication')).toBeInTheDocument()
  })
})