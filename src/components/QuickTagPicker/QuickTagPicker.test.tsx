import { describe, test, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../../utils/test-utils'
import { QuickTagPicker } from './QuickTagPicker'

// Bookmark ID in 'career' and 'AI' tags
const taggedBookmarkId = '2c35d841-e0f0-465b-9691-631cf05922e7'

// Bookmark ID with no tags
const untaggedBookmarkId = 'no-tags-id'

describe('QuickTagPicker', () => {
  test('renders filter input and tag list', async () => {
    render(<QuickTagPicker bookmarkId={untaggedBookmarkId} onClose={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByTestId('quick-tag-filter')).toBeInTheDocument()
      expect(screen.getByTestId('quick-tag-list')).toBeInTheDocument()
    })
  })

  test('lists all tags', async () => {
    render(<QuickTagPicker bookmarkId={untaggedBookmarkId} onClose={vi.fn()} />)

    await waitFor(() => {
      const options = screen.getAllByTestId('quick-tag-option')
      expect(options).toHaveLength(3)
    })

    expect(screen.getByText('career')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('CSS')).toBeInTheDocument()
  })

  test('shows checkmark on assigned tags', async () => {
    render(<QuickTagPicker bookmarkId={taggedBookmarkId} onClose={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getAllByTestId('quick-tag-option')).toHaveLength(3)
    })

    // 'career' and 'AI' are assigned to this bookmark
    const checks = screen.getAllByTestId('quick-tag-check')
    expect(checks).toHaveLength(2)
  })

  test('filters tags by search text', async () => {
    render(<QuickTagPicker bookmarkId={untaggedBookmarkId} onClose={vi.fn()} />)

    // Wait for tags to load first
    await waitFor(() => {
      expect(screen.getAllByTestId('quick-tag-option')).toHaveLength(3)
    })

    fireEvent.change(screen.getByTestId('quick-tag-filter'), {
      target: { value: 'css' }
    })

    const options = screen.getAllByTestId('quick-tag-option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('CSS')
  })

  test('shows empty message when no tags match filter', async () => {
    render(<QuickTagPicker bookmarkId={untaggedBookmarkId} onClose={vi.fn()} />)

    // Wait for tags to load first
    await waitFor(() => {
      expect(screen.getAllByTestId('quick-tag-option')).toHaveLength(3)
    })

    fireEvent.change(screen.getByTestId('quick-tag-filter'), {
      target: { value: 'nonexistent' }
    })

    expect(screen.queryAllByTestId('quick-tag-option')).toHaveLength(0)
    expect(screen.getByText('No categories found')).toBeInTheDocument()
  })

  test('calls onClose on Escape', async () => {
    const onClose = vi.fn()
    render(<QuickTagPicker bookmarkId={untaggedBookmarkId} onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByTestId('quick-tag-picker')).toBeInTheDocument()
    })

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  test('clicking a tag toggles assignment', async () => {
    render(<QuickTagPicker bookmarkId={taggedBookmarkId} onClose={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getAllByTestId('quick-tag-option')).toHaveLength(3)
    })

    // CSS is unassigned — click to assign
    const cssOption = screen.getByText('CSS').closest('[data-testid="quick-tag-option"]')!
    fireEvent.click(cssOption)

    // After mutation + re-render, CSS should now have a checkmark
    await waitFor(() => {
      expect(screen.getAllByTestId('quick-tag-check')).toHaveLength(3)
    })
  })
})
