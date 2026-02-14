import { describe, test, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../../utils/test-utils'
import { AddTag } from './AddTag'

// Bookmark ID that exists in 'career' and 'AI' tags in testData
const taggedBookmarkId = '2c35d841-e0f0-465b-9691-631cf05922e7'

// Bookmark ID that has no tags
const untaggedBookmarkId = 'no-tags-id'

describe('AddTag', () => {
  test('renders the search input', async () => {
    render(<AddTag bookmarkId={untaggedBookmarkId} />)

    await waitFor(() => {
      expect(screen.getByTestId('tag-search-input')).toBeInTheDocument()
    })
  })

  test('shows assigned tags as chips for a tagged bookmark', async () => {
    render(<AddTag bookmarkId={taggedBookmarkId} />)

    await waitFor(() => {
      expect(screen.getByTestId('assigned-tags')).toBeInTheDocument()
    })

    expect(screen.getByText('career')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  test('does not show assigned tags section for untagged bookmark', async () => {
    render(<AddTag bookmarkId={untaggedBookmarkId} />)

    await waitFor(() => {
      expect(screen.getByTestId('tag-search-input')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('assigned-tags')).not.toBeInTheDocument()
  })

  test('shows dropdown with unassigned tags on focus', async () => {
    render(<AddTag bookmarkId={taggedBookmarkId} />)

    await waitFor(() => {
      expect(screen.getByTestId('tag-search-input')).toBeInTheDocument()
    })

    fireEvent.focus(screen.getByTestId('tag-search-input'))

    await waitFor(() => {
      expect(screen.getByTestId('tag-dropdown')).toBeInTheDocument()
    })

    // CSS is not assigned to this bookmark, so it should appear in dropdown
    const options = screen.getAllByTestId('tag-dropdown-option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('CSS')
  })

  test('filters dropdown options by search text', async () => {
    render(<AddTag bookmarkId={untaggedBookmarkId} />)

    await waitFor(() => {
      expect(screen.getByTestId('tag-search-input')).toBeInTheDocument()
    })

    const input = screen.getByTestId('tag-search-input')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'car' } })

    await waitFor(() => {
      expect(screen.getByTestId('tag-dropdown')).toBeInTheDocument()
    })

    const options = screen.getAllByTestId('tag-dropdown-option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('career')
  })

  test('assigns a tag when clicking a dropdown option', async () => {
    render(<AddTag bookmarkId={untaggedBookmarkId} />)

    await waitFor(() => {
      expect(screen.getByTestId('tag-search-input')).toBeInTheDocument()
    })

    fireEvent.focus(screen.getByTestId('tag-search-input'))

    await waitFor(() => {
      expect(screen.getByTestId('tag-dropdown')).toBeInTheDocument()
    })

    // Click the first option to assign it
    const options = screen.getAllByTestId('tag-dropdown-option')
    fireEvent.click(options[0])

    // After assignment, the tag should appear as an assigned chip
    await waitFor(() => {
      expect(screen.getByTestId('assigned-tags')).toBeInTheDocument()
    })
  })

  test('each assigned tag chip has a remove button', async () => {
    render(<AddTag bookmarkId={taggedBookmarkId} />)

    await waitFor(() => {
      expect(screen.getByTestId('assigned-tags')).toBeInTheDocument()
    })

    const removeButtons = screen.getAllByTestId('tag-chip-remove')
    expect(removeButtons).toHaveLength(2)
  })

  test('closes dropdown on Escape key', async () => {
    render(<AddTag bookmarkId={untaggedBookmarkId} />)

    await waitFor(() => {
      expect(screen.getByTestId('tag-search-input')).toBeInTheDocument()
    })

    const input = screen.getByTestId('tag-search-input')
    fireEvent.focus(input)

    await waitFor(() => {
      expect(screen.getByTestId('tag-dropdown')).toBeInTheDocument()
    })

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByTestId('tag-dropdown')).not.toBeInTheDocument()
  })
})
