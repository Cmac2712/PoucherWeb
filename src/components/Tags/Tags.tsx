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
    <div className="tags pt-4" data-testid="tags-container">
      <>
        <h3 className="text-md p-2 px-4 mr-4 mb-2 font-bold text-foreground">Categories</h3>
        <ul className="p-0 mb-4">
          <li className="relative">
            <a
              href="#"
              className={`flex items-center justify-between py-2 px-2 hover:bg-background-darker transition-all ${
                category === 'All' ? 'bg-background-darker' : ''
              }`}
              onClick={(e) => {
                setCategory('All')
                setBookmarkIDs(undefined)
                e.preventDefault()
              }}
            >
              <div className="p-1 opacity-75 font-semibold text-foreground">All ({count})</div>
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
                    className={`flex items-center justify-between py-2 px-2 hover:bg-background-darker transition-all ${
                      category === title ? 'bg-background-darker' : ''
                    }`}
                    onClick={(e) => {
                      setCategory(title)
                      setBookmarkIDs(JSON.parse(bookmarkID)?.list)
                      e.preventDefault()
                    }}
                  >
                    <div className="p-1 opacity-75 font-semibold text-foreground">
                      {title} ({bookmarksCount})
                    </div>
                  </a>
                  <div className="absolute right-4 top-0 bottom-0 m-auto h-6">
                    <button
                      className="opacity-40 hover:opacity-100 transition-opacity text-foreground-muted"
                      onClick={() => {
                        setModalContent(<DeleteTag ID={ID} tagName={title} />)
                        openModal()
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashCan} />
                    </button>
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
