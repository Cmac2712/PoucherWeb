import { useEffect } from 'react'
import { BookmarkPreview } from './BookmarkPreview'
import { useUser } from '../../contexts/user-context'
import { usePageStore } from '../../store/page-store'
import { BookmarkSkeleton } from './BookmarkSkeleton'
import { useSearchBookmarks } from '../../api/hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

export interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  videoURL?: string
  authorID?: string
  screenshotURL?: string
  metadata?: Record<string, unknown>
  metadataStatus?: 'pending' | 'ready' | 'failed'
  metadataError?: string | null
  metadataUpdatedAt?: string | null
  createdAt?: string
}

export interface PaginationProps {
  perPage: number
  offset: number
  search: string
}

export const Bookmarks = () => {
  const search = usePageStore((state) => state.search)
  const setSearch = usePageStore((state) => state.setSearch)
  const offset = usePageStore((state) => state.offset)
  const perPage = usePageStore((state) => state.perPage)
  const bookmarkIDs = usePageStore((state) => state.bookmarkIDs)
  const bookmarks = usePageStore((state) => state.bookmarks)
  const setCount = usePageStore((state) => state.setCount)
  const setBookmarks = usePageStore((state) => state.setBookmarks)
  const user = useUser()

  const { data, isLoading, error } = useSearchBookmarks({
    offset,
    limit: perPage,
    ids: bookmarkIDs ? JSON.stringify(bookmarkIDs) : undefined,
    authorID: user.data?.user.id,
    title: search,
    description: search
  })

  useEffect(() => {
    if (data) {
      setCount(data.count)
      setBookmarks(data.bookmarks)
    }
  }, [data, setCount, setBookmarks])

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <BookmarkSkeleton key={i} />
      ))}
    </div>
  )

  if (error) return <p>{JSON.stringify(error)}</p>

  return (
    <div>
      {/* Search results indicator */}
      {search && (
        <div className="flex items-center gap-2 mb-6 text-foreground-muted dark:text-gray-400">
          <p>
            Showing results for <span className="text-foreground dark:text-gray-100 font-medium">"{search}"</span>
          </p>
          <button
            onClick={() => setSearch('')}
            className="text-forest-400 hover:text-forest-300 transition-colors flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faClose} className="text-xs" />
            clear
          </button>
        </div>
      )}

      {/* Bookmarks grid */}
      {bookmarks.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bookmarks.map((data) => (
            <BookmarkPreview key={data.id} data={data} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-foreground-muted dark:text-gray-400 text-lg">No bookmarks yet</p>
          <p className="text-foreground-muted dark:text-gray-400 text-sm mt-2">
            Click "Add Bookmark" to save your first link
          </p>
        </div>
      )}
    </div>
  )
}
