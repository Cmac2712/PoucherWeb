import { usePage } from '../../contexts/page-context'
import { useUser } from '../../contexts/user-context'
import { Loader } from '../Loader'
import { CreateTag } from '../CreateTag'
import { DeleteTag } from '../DeleteTag'

export type Tag = {
  ID: string
  authorID: string
  bookmarkID: string
  title: string
}

interface Props {
  callback?: () => void
}

const Tags = ({ callback }: Props) => {
  const {
    setOffset,
    setSearch,
    setBookmarkIDs,
    bookmarks: {
      data: { getBookmarksCount: bookmarksCount } = { getBookmarksCount: 0 }
    }
  } = usePage()
  const { data: { getTags: tags } = { getTags: [] }, loading } = useUser()

  if (loading) return <Loader />

  return (
    <div className="tags pt-4">
      {tags.length > 0 && (
        <>
          <h3 className="text-md p-2 px-4 mr-4 mb-2 font-bold">Categories</h3>
          <ul className="p-0 mb-4">
            <li
              className={`flex items-center justify-between px-4`}
              onClick={() => {
                setBookmarkIDs(undefined)
              }}
            >
              <div className="p-1 opacity-75 font-semibold">
                <a
                  href="#"
                  className="hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  All ({bookmarksCount})
                </a>
              </div>
            </li>
            {tags.map(({ title, bookmarkID, ID }, i) => {
              const bookmarksCount = JSON.parse(bookmarkID)?.list?.length || 0

              return (
                <li
                  key={i}
                  className={`flex items-center justify-between px-4`}
                  onClick={() => {
                    setBookmarkIDs(JSON.parse(bookmarkID)?.list)
                  }}
                >
                  <div className="p-1 opacity-75 font-semibold">
                    <a
                      href="#"
                      className="hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {title} ({bookmarksCount})
                    </a>
                  </div>
                  <DeleteTag ID={ID} />
                </li>
              )
            })}
          </ul>
        </>
      )}
      <div className="px-4">
        <CreateTag />
      </div>
    </div>
  )
}

export { Tags }
