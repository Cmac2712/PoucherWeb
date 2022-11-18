import { BookmarkPreview } from './BookmarkPreview'
import { useUser } from '../../contexts/user-context'
import { usePageStore } from '../../store/page-store'
import { Loader } from '../Loader/Loader'
import { useQuery } from '@apollo/client'
import { SEARCH_BOOKMARKS } from '../Search'

export interface Bookmark {
  id: string
  title: string
  description: string
  url: string
  videoURL?: string
  authorID?: string
  screenshotURL?: string
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

  const { loading, error } = useQuery<{
    searchBookmarks: Bookmark[]
    getBookmarksCount: number
  }>(SEARCH_BOOKMARKS, {
    variables: {
      offset,
      limit: perPage,
      input: {
        id: JSON.stringify(bookmarkIDs),
        authorID: user.data?.createUser.id,
        title: search,
        description: search
      }
    },
    onCompleted: (data) => {
      setCount(data.getBookmarksCount)
      setBookmarks(data.searchBookmarks)
    }
  })

  if (loading) return <Loader />

  if (error) return <p>{JSON.stringify(error)}</p>

  return (
    <div className="flex flex-wrap items-start">
      {/* DISPLAY CURRENT SEARCH TERM */}
      {search && (
        <div className="flex search-text p-4">
          <p className="mr-2">
            Search results for <em>{search}</em>
          </p>
          <button
            onClick={() => setSearch('')}
            className="text-blue-500 underline"
          >
            clear search
          </button>
        </div>
      )}

      <ul className="basis-full">
        {bookmarks.length ? (
          bookmarks.map((data) => {
            return (
              <li
                className="basis-full border-base-300 border-t first:border-0"
                key={data.id}
              >
                <BookmarkPreview data={data} />
              </li>
            )
          })
        ) : (
          <div className="flex justify-center w-full h-screen">
            <p className="mt-10">You haven't added any bookmarks yet.</p>
          </div>
        )}
      </ul>
    </div>
  )
}
