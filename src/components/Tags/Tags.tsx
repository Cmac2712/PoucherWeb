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
    setBookmarkIDs,
    bookmarks: {
      data: { getBookmarksCount: bookmarksCount } = { getBookmarksCount: 0 }
    },
    category,
    setCategory
  } = usePage()
  const {
    data: { getTags: tags, createUser: { id } } = {
      getTags: [],
      createUser: { id: 0 }
    },
    loading
  } = useUser()

  if (loading || id === 0) return <Loader />

  return (
    <div className="tags pt-4" data-testid="tags-container">
      <>
        <h3 className="text-md p-2 px-4 mr-4 mb-2 font-bold">Categories</h3>
        <ul className="p-0 mb-4">
          <li className="relative">
            <a
              href="#"
              className={`flex items-center justify-between py-2 px-2 hover:bg-base-300 transition-all ${
                category === 'All' ? 'bg-base-300' : ''
              }`}
              onClick={(e) => {
                setCategory('All')
                setBookmarkIDs(undefined)
                e.preventDefault()
              }}
            >
              <div className="p-1 opacity-75 font-semibold">
                All ({bookmarksCount})
              </div>
            </a>
          </li>
          {tags &&
            tags.length > 0 &&
            tags.map(({ title, bookmarkID, ID }, i) => {
              const bookmarksCount = JSON.parse(bookmarkID)?.list?.length || 0

              return (
                <li className="relative" key={i}>
                  <a
                    href="#"
                    className={`flex items-center justify-between py-2 px-2 hover:bg-base-300 transition-all ${
                      category === title ? 'bg-base-300' : ''
                    }`}
                    onClick={(e) => {
                      setCategory(title)
                      setBookmarkIDs(JSON.parse(bookmarkID)?.list)
                      e.preventDefault()
                    }}
                  >
                    <div className="p-1 opacity-75 font-semibold">
                      {title} ({bookmarksCount})
                    </div>
                  </a>
                  <div className="absolute right-4 top-0 bottom-0 m-auto h-6">
                    <DeleteTag ID={ID} />
                  </div>
                </li>
              )
            })}
        </ul>
      </>
      <div className="px-4">
        <CreateTag />
      </div>
    </div>
  )
}

export { Tags }
