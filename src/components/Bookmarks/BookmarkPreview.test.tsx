import { describe, test, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../../utils/test-utils'
import { BookmarkPreview } from './BookmarkPreview'
import type { Bookmark } from './Bookmarks'

const makeBookmark = (overrides: Partial<Bookmark> = {}): Bookmark => ({
  id: 'bookmark-1',
  title: 'Example title',
  description: 'Example description',
  url: 'https://example.com',
  metadataStatus: 'ready',
  ...overrides
})

// This bookmark ID exists in both 'career' and 'AI' tags in testData
const taggedBookmark = makeBookmark({
  id: '2c35d841-e0f0-465b-9691-631cf05922e7',
  title: 'Tagged Bookmark',
  description: 'A bookmark that has tags',
})

// This bookmark ID does not exist in any tags in testData
const untaggedBookmark = makeBookmark({
  id: 'no-tags-bookmark-id',
  title: 'Untagged Bookmark',
  description: 'A bookmark with no tags',
})

describe('BookmarkPreview', () => {
  test('renders bookmark title and description', async () => {
    render(<BookmarkPreview data={untaggedBookmark} />)

    await waitFor(() => {
      expect(screen.getByText('Untagged Bookmark')).toBeInTheDocument()
      expect(screen.getByText('A bookmark with no tags')).toBeInTheDocument()
    })
  })

  test('shows a skeleton while metadata is pending', () => {
    const bookmark = makeBookmark({ metadataStatus: 'pending' })

    render(<BookmarkPreview data={bookmark} />)

    expect(screen.getByTestId('metadata-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('Example title')).not.toBeInTheDocument()
  })

  test('shows title and description when metadata is ready', () => {
    const bookmark = makeBookmark({ metadataStatus: 'ready' })

    render(<BookmarkPreview data={bookmark} />)

    expect(screen.queryByTestId('metadata-skeleton')).not.toBeInTheDocument()
    expect(screen.getByText('Example title')).toBeInTheDocument()
    expect(screen.getByText('Example description')).toBeInTheDocument()
  })

  test('does not render tag chips when bookmark has no tags', async () => {
    render(<BookmarkPreview data={untaggedBookmark} />)

    await waitFor(() => {
      expect(screen.getByText('Untagged Bookmark')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('bookmark-tags')).not.toBeInTheDocument()
  })

  test('renders tag chips for a tagged bookmark', async () => {
    render(<BookmarkPreview data={taggedBookmark} />)

    await waitFor(() => {
      expect(screen.getByTestId('bookmark-tags')).toBeInTheDocument()
    })

    expect(screen.getByText('career')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  test('each tag chip has a remove button', async () => {
    render(<BookmarkPreview data={taggedBookmark} />)

    await waitFor(() => {
      expect(screen.getByTestId('bookmark-tags')).toBeInTheDocument()
    })

    const removeButtons = screen.getAllByTestId('tag-chip-remove')
    expect(removeButtons).toHaveLength(2)
  })

  test('clicking remove on a tag chip triggers tag update', async () => {
    render(<BookmarkPreview data={taggedBookmark} />)

    await waitFor(() => {
      expect(screen.getByTestId('bookmark-tags')).toBeInTheDocument()
    })

    const removeButtons = screen.getAllByTestId('tag-chip-remove')
    fireEvent.click(removeButtons[0])

    // The mutation fires — we verify that the tag chip is eventually removed
    // after the mutation invalidates queries and the component re-renders
    await waitFor(() => {
      expect(screen.queryByText('career')).not.toBeInTheDocument()
    })
  })

  test('renders Tag button in actions bar', async () => {
    render(<BookmarkPreview data={untaggedBookmark} />)

    await waitFor(() => {
      expect(screen.getByTestId('quick-tag-button')).toBeInTheDocument()
    })

    expect(screen.getByText('Tag')).toBeInTheDocument()
  })

  test('clicking Tag button opens QuickTagPicker', async () => {
    render(<BookmarkPreview data={untaggedBookmark} />)

    await waitFor(() => {
      expect(screen.getByTestId('quick-tag-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('quick-tag-button'))

    await waitFor(() => {
      expect(screen.getByTestId('quick-tag-picker')).toBeInTheDocument()
    })
  })

  test('clicking Tag button again closes QuickTagPicker', async () => {
    render(<BookmarkPreview data={untaggedBookmark} />)

    await waitFor(() => {
      expect(screen.getByTestId('quick-tag-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('quick-tag-button'))

    await waitFor(() => {
      expect(screen.getByTestId('quick-tag-picker')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('quick-tag-button'))

    expect(screen.queryByTestId('quick-tag-picker')).not.toBeInTheDocument()
  })
})
