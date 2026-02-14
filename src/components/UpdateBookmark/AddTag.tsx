import { useState, useRef, useEffect } from 'react'
import { useUser } from '../../contexts/user-context'
import { useUpdateTag } from '../../api/hooks'
import { Input } from '../ui/input'
import { TagChip } from '../TagChip'
import {
  tagContainsBookmark,
  addBookmarkToTag,
  removeBookmarkFromTag,
  getTagsForBookmark
} from '../../utils/tag-utils'

interface Props {
  bookmarkId: string
}

const AddTag = ({ bookmarkId }: Props) => {
  const { data } = useUser()
  const tags = data?.tags || []
  const updateTagMutation = useUpdateTag()

  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const assignedTags = getTagsForBookmark(tags, bookmarkId)
  const unassignedTags = tags.filter((tag) => !tagContainsBookmark(tag, bookmarkId))
  const filteredTags = unassignedTags.filter((tag) =>
    tag.title.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    setHighlightIndex(0)
  }, [search])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const assignTag = (tagId: string) => {
    const tag = tags.find((t) => t.ID === tagId)
    if (!tag) return

    const updatedBookmarkID = addBookmarkToTag(tag, bookmarkId)
    if (updatedBookmarkID === tag.bookmarkID) return

    updateTagMutation.mutate({
      id: tag.ID,
      updates: { bookmarkID: updatedBookmarkID }
    })

    setSearch('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const removeTag = (tagId: string) => {
    const tag = tags.find((t) => t.ID === tagId)
    if (!tag) return

    updateTagMutation.mutate({
      id: tag.ID,
      updates: { bookmarkID: removeBookmarkFromTag(tag, bookmarkId) }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredTags.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((i) => (i + 1) % filteredTags.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((i) => (i - 1 + filteredTags.length) % filteredTags.length)
        break
      case 'Enter':
        e.preventDefault()
        assignTag(filteredTags[highlightIndex].ID)
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div ref={containerRef} className="mt-3" data-testid="add-tag">
      {/* Assigned tags */}
      {assignedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2" data-testid="assigned-tags">
          {assignedTags.map((tag) => (
            <TagChip
              key={tag.ID}
              label={tag.title}
              size="md"
              onRemove={() => removeTag(tag.ID)}
            />
          ))}
        </div>
      )}

      {/* Combobox */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          data-testid="tag-search-input"
        />

        {/* Dropdown */}
        {isOpen && filteredTags.length > 0 && (
          <ul
            className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
            data-testid="tag-dropdown"
            role="listbox"
          >
            {filteredTags.map((tag, index) => (
              <li
                key={tag.ID}
                role="option"
                aria-selected={index === highlightIndex}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  index === highlightIndex
                    ? 'bg-forest-50 dark:bg-forest-900/50 text-forest-700 dark:text-forest-300'
                    : 'text-foreground dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => assignTag(tag.ID)}
                data-testid="tag-dropdown-option"
              >
                {tag.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export { AddTag }
