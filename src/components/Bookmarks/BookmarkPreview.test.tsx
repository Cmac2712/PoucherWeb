import { describe, expect, it } from 'vitest'
import { render, screen } from '../../utils/test-utils'
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

describe('BookmarkPreview', () => {
  it('shows a skeleton while metadata is pending', () => {
    const bookmark = makeBookmark({
      metadataStatus: 'pending'
    })

    render(<BookmarkPreview data={bookmark} />)

    expect(screen.getByText('Fetching metadata')).toBeInTheDocument()
    expect(screen.getByTestId('metadata-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('Example title')).not.toBeInTheDocument()
  })

  it('shows title and description when metadata is ready', () => {
    const bookmark = makeBookmark({
      metadataStatus: 'ready'
    })

    render(<BookmarkPreview data={bookmark} />)

    expect(screen.queryByTestId('metadata-skeleton')).not.toBeInTheDocument()
    expect(screen.getByText('Example title')).toBeInTheDocument()
    expect(screen.getByText('Example description')).toBeInTheDocument()
  })
})
