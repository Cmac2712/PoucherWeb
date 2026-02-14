import { useState } from 'react'
import { usePageStore } from '../../store/page-store'
import { useUser } from '../../contexts/user-context'
import { Loader } from '../Loader'
import { CreateTag } from '../CreateTag'
import { DeleteTag } from '../DeleteTag'
import { useModalStore } from '../../store/modal-store'
import { useUpdateTag } from '../../api/hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { getBookmarkCount, parseBookmarkIds } from '../../utils/tag-utils'
import { Input } from '../ui/input'

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
  const updateTagMutation = useUpdateTag()

  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const startEditing = (tagId: string, currentTitle: string) => {
    setEditingTagId(tagId)
    setEditTitle(currentTitle)
  }

  const commitRename = () => {
    if (editingTagId && editTitle.trim() && editTitle.trim() !== tags.find((t) => t.ID === editingTagId)?.title) {
      updateTagMutation.mutate({
        id: editingTagId,
        updates: { title: editTitle.trim() }
      })
    }
    setEditingTagId(null)
    setEditTitle('')
  }

  const cancelEditing = () => {
    setEditingTagId(null)
    setEditTitle('')
  }

  if (loading || !id) return <Loader />

  return (
    <div className="flex-1 overflow-y-auto" data-testid="tags-container">
      {/* Section header */}
      <h3 className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted dark:text-gray-400">
        Categories
      </h3>

      {/* Category list */}
      <ul className="px-3">
        {/* All category */}
        <li>
          <button
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
              category === 'All'
                ? 'bg-forest-50 dark:bg-forest-900/50 text-forest-700 dark:text-forest-300'
                : 'text-foreground-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground dark:hover:text-gray-100'
            }`}
            onClick={() => {
              setCategory('All')
              setBookmarkIDs(undefined)
            }}
          >
            <span className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  category === 'All' ? 'bg-forest-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              All
            </span>
            <span className="text-xs text-foreground-muted dark:text-gray-400">{count}</span>
          </button>
        </li>

        {/* User categories */}
        {tags.map((tag) => {
          const bookmarksCount = getBookmarkCount(tag)
          const isActive = category === tag.title
          const isEditing = editingTagId === tag.ID

          return (
            <li key={tag.ID} className="group relative">
              <button
                className={`w-full flex items-center justify-between px-3 py-2 pr-16 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-forest-50 dark:bg-forest-900/50 text-forest-700 dark:text-forest-300'
                    : 'text-foreground-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground dark:hover:text-gray-100'
                }`}
                onClick={() => {
                  if (!isEditing) {
                    setCategory(tag.title)
                    setBookmarkIDs(parseBookmarkIds(tag.bookmarkID).list)
                  }
                }}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive ? 'bg-forest-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                  {isEditing ? (
                    <Input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename()
                        if (e.key === 'Escape') cancelEditing()
                      }}
                      onBlur={commitRename}
                      onClick={(e) => e.stopPropagation()}
                      className="h-6 px-1 py-0 text-sm"
                      data-testid="tag-rename-input"
                    />
                  ) : (
                    <span className="truncate">{tag.title}</span>
                  )}
                </span>
                {!isEditing && (
                  <span className="text-xs text-foreground-muted dark:text-gray-400">{bookmarksCount}</span>
                )}
              </button>

              {/* Action buttons */}
              {!isEditing && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="text-foreground-muted dark:text-gray-400 hover:text-forest-500 p-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditing(tag.ID, tag.title)
                    }}
                    aria-label={`Rename ${tag.title}`}
                    data-testid="tag-rename-button"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                  </button>
                  <button
                    className="text-foreground-muted dark:text-gray-400 hover:text-red-500 p-1"
                    onClick={() => {
                      setModalContent(<DeleteTag ID={tag.ID} tagName={tag.title} />)
                      openModal()
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                  </button>
                </div>
              )}
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
