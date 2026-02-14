import { describe, test, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../../utils/test-utils'
import { BookmarkPreview } from './BookmarkPreview'

// This bookmark ID exists in both 'career' and 'AI' tags in testData
const taggedBookmark = {
  id: '2c35d841-e0f0-465b-9691-631cf05922e7',
  title: 'Tagged Bookmark',
  description: 'A bookmark that has tags',
  url: 'https://example.com',
  screenshotURL: '',
}

// This bookmark ID does not exist in any tags in testData
const untaggedBookmark = {
  id: 'no-tags-bookmark-id',
  title: 'Untagged Bookmark',
  description: 'A bookmark with no tags',
  url: 'https://example.com',
  screenshotURL: '',
}

describe('BookmarkPreview', () => {
  test('renders bookmark title and description', async () => {
    render(<BookmarkPreview data={untaggedBookmark} />)

    await waitFor(() => {
      expect(screen.getByText('Untagged Bookmark')).toBeInTheDocument()
      expect(screen.getByText('A bookmark with no tags')).toBeInTheDocument()
    })
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
})
