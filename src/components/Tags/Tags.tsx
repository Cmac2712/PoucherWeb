import { usePageStore } from '../../store/page-store'
import { useUser } from '../../contexts/user-context'
import { Loader } from '../Loader'
import { CreateTag } from '../CreateTag'
import { DeleteTag } from '../DeleteTag'
import { useModalStore } from '../../store/modal-store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

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
  const setBookmarkIDs = usePageStore((state) => state.setBookmarkIDs)
  const category = usePageStore((state) => state.category)
  const count = usePageStore((state) => state.count)
  const setCategory = usePageStore((state) => state.setCategory)

  const { data, loading } = useUser()
  const tags = data?.tags ?? []
  const id = data?.user?.id
  const openModal = useModalStore((state) => state.openModal)
  const setModalContent = useModalStore((state) => state.setModalContent)

  if (loading || !id) return <Loader />

  return (
    <div className="flex-1 overflow-y-auto" data-testid="tags-container">
      {/* Section header */}
      <h3 className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        Categories
      </h3>

      {/* Category list */}
      <ul className="px-3">
        {/* All category */}
        <li>
          <button
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
              category === 'All'
                ? 'bg-forest-50 text-forest-700'
                : 'text-foreground-muted hover:bg-gray-100 hover:text-foreground'
            }`}
            onClick={() => {
              setCategory('All')
              setBookmarkIDs(undefined)
            }}
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  category === 'All' ? 'bg-forest-500' : 'bg-gray-300'
                }`}
              />
              All
            </span>
            <span className="text-xs text-foreground-muted">{count}</span>
          </button>
        </li>

        {/* User categories */}
        {tags.map(({ title, bookmarkID, ID }) => {
          const bookmarksCount = JSON.parse(bookmarkID)?.list?.length || 0
          const isActive = category === title

          return (
            <li key={ID} className="group relative">
              <button
                className={`w-full flex items-center justify-between px-3 py-2 pr-10 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-forest-50 text-forest-700'
                    : 'text-foreground-muted hover:bg-gray-100 hover:text-foreground'
                }`}
                onClick={() => {
                  setCategory(title)
                  setBookmarkIDs(JSON.parse(bookmarkID)?.list)
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-forest-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="truncate">{title}</span>
                </span>
                <span className="text-xs text-foreground-muted">{bookmarksCount}</span>
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-foreground-muted hover:text-red-500 p-1"
                onClick={() => {
                  setModalContent(<DeleteTag ID={ID} tagName={title} />)
                  openModal()
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
              </button>
            </li>
          )
        })}
      </ul>

      {/* Add category button */}
      <div className="px-6 py-4">
        <CreateTag />
      </div>
    </div>
  )
}

export { Tags }
