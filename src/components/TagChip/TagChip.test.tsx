import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TagChip } from './TagChip'

describe('TagChip', () => {
  it('renders the label', () => {
    render(<TagChip label="career" />)
    expect(screen.getByText('career')).toBeInTheDocument()
  })

  it('applies sm size classes', () => {
    render(<TagChip label="career" size="sm" />)
    const chip = screen.getByTestId('tag-chip')
    expect(chip.className).toContain('text-xs')
  })

  it('applies md size classes by default', () => {
    render(<TagChip label="career" />)
    const chip = screen.getByTestId('tag-chip')
    expect(chip.className).toContain('text-sm')
  })

  it('shows remove button when onRemove is provided', () => {
    const onRemove = vi.fn()
    render(<TagChip label="career" onRemove={onRemove} />)
    expect(screen.getByTestId('tag-chip-remove')).toBeInTheDocument()
  })

  it('does not show remove button when onRemove is not provided', () => {
    render(<TagChip label="career" />)
    expect(screen.queryByTestId('tag-chip-remove')).not.toBeInTheDocument()
  })

  it('calls onRemove when X button is clicked', () => {
    const onRemove = vi.fn()
    render(<TagChip label="career" onRemove={onRemove} />)
    fireEvent.click(screen.getByTestId('tag-chip-remove'))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('calls onClick when chip is clicked', () => {
    const onClick = vi.fn()
    render(<TagChip label="career" onClick={onClick} />)
    fireEvent.click(screen.getByTestId('tag-chip'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not propagate click to onClick when remove is clicked', () => {
    const onClick = vi.fn()
    const onRemove = vi.fn()
    render(<TagChip label="career" onClick={onClick} onRemove={onRemove} />)
    fireEvent.click(screen.getByTestId('tag-chip-remove'))
    expect(onRemove).toHaveBeenCalledOnce()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('has button role when onClick is provided', () => {
    render(<TagChip label="career" onClick={() => {}} />)
    expect(screen.getByTestId('tag-chip')).toHaveAttribute('role', 'button')
  })

  it('has no role when onClick is not provided', () => {
    render(<TagChip label="career" />)
    expect(screen.getByTestId('tag-chip')).not.toHaveAttribute('role')
  })

  it('applies custom className', () => {
    render(<TagChip label="career" className="my-custom-class" />)
    const chip = screen.getByTestId('tag-chip')
    expect(chip.className).toContain('my-custom-class')
  })
})
