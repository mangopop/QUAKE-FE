import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TestCard from '../TestCard'

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
    title: 'Sample Test',
    template: 'Basic Template',
    sections: [
      { title: 'Section 1', content: 'Content 1' },
      { title: 'Section 2', content: 'Content 2' },
    ],
  }

  it('renders the test title correctly', () => {
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
})