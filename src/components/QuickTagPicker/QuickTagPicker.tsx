import { useState, useRef, useEffect } from 'react'
import { useUser } from '../../contexts/user-context'
import { useUpdateTag } from '../../api/hooks'
import { Input } from '../ui/input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import {
  tagContainsBookmark,
  addBookmarkToTag,
  removeBookmarkFromTag
} from '../../utils/tag-utils'

interface Props {
  bookmarkId: string
  onClose: () => void
}

const QuickTagPicker = ({ bookmarkId, onClose }: Props) => {
  const { data } = useUser()
  const tags = data?.tags || []
  const updateTagMutation = useUpdateTag()

  const [filter, setFilter] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredTags = tags.filter((tag) =>
    tag.title.toLowerCase().includes(filter.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const toggleTag = (tagId: string) => {
    const tag = tags.find((t) => t.ID === tagId)
    if (!tag) return

    const isAssigned = tagContainsBookmark(tag, bookmarkId)

    updateTagMutation.mutate({
      id: tag.ID,
      updates: {
        bookmarkID: isAssigned
          ? removeBookmarkFromTag(tag, bookmarkId)
          : addBookmarkToTag(tag, bookmarkId)
      }
    })
  }

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full mb-2 left-0 w-56 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-20"
      data-testid="quick-tag-picker"
    >
      <div className="p-2 border-b border-gray-100 dark:border-gray-700">
        <Input
          autoFocus
          type="text"
          placeholder="Filter categories..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-7 text-xs"
          data-testid="quick-tag-filter"
        />
      </div>
      <ul className="max-h-40 overflow-y-auto py-1" role="listbox" data-testid="quick-tag-list">
        {filteredTags.length > 0 ? (
          filteredTags.map((tag) => {
            const isAssigned = tagContainsBookmark(tag, bookmarkId)
            return (
              <li
                key={tag.ID}
                role="option"
                aria-selected={isAssigned}
                className="flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-foreground dark:text-gray-100 transition-colors"
                onClick={() => toggleTag(tag.ID)}
                data-testid="quick-tag-option"
              >
                <span>{tag.title}</span>
                {isAssigned && (
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-xs text-forest-500"
                    data-testid="quick-tag-check"
                  />
                )}
              </li>
            )
          })
        ) : (
          <li className="px-3 py-1.5 text-sm text-foreground-muted dark:text-gray-400">
            No categories found
          </li>
        )}
      </ul>
    </div>
  )
}

export { QuickTagPicker }
