import { useState } from 'react'
import { UpdateBookmark } from '../UpdateBookmark'
import { DeleteBookmark } from '../DeleteBookmark'
import { Bookmark } from './Bookmarks'
import { useCognitoAuth } from '../../contexts/auth-context'
import { useModalStore } from '../../store/modal-store'
import { useUser } from '../../contexts/user-context'
import { useUpdateTag } from '../../api/hooks'
import { getTagsForBookmark, removeBookmarkFromTag } from '../../utils/tag-utils'
import { TagChip } from '../TagChip'
import { Button } from '../ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faGlobe, faTag } from '@fortawesome/free-solid-svg-icons'
import { QuickTagPicker } from '../QuickTagPicker'

type Props = {
  data: Bookmark
}

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export const BookmarkPreview = ({
  data: { id, url, title, description, metadataStatus }
}: Props) => {
  const [, setUpdateMode] = useState(false)
  const [hover, setHover] = useState(false)
  const [quickTagOpen, setQuickTagOpen] = useState(false)
  const { user } = useCognitoAuth()
  const { openModal, setModalContent } = useModalStore()
  const { data: userData } = useUser()
  const updateTagMutation = useUpdateTag()
  const bookmarkTags = getTagsForBookmark(userData?.tags ?? [], id)
  const isMetadataPending = metadataStatus === 'pending'

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-forest-300 dark:hover:border-forest-600 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Content */}
      <div className="p-4">
        {/* Domain + type icon */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs text-foreground-muted dark:text-gray-400 truncate">
            {getDomain(url)}
          </p>
          <div className="flex items-center gap-2">
            {metadataStatus === 'failed' && (
              <span className="text-[10px] uppercase tracking-wide text-red-600 dark:text-red-400">
                Metadata failed
              </span>
            )}
            <FontAwesomeIcon
              icon={faBookmark}
              className="text-forest-500 dark:text-forest-400"
              title="Bookmark"
            />
          </div>
        </div>

        {isMetadataPending ? (
          <div data-testid="metadata-skeleton" className="mb-4 space-y-2 animate-pulse">
            <div className="h-5 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ) : (
          <>
            {/* Title */}
            <h3 className="font-semibold text-foreground dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-forest-600 dark:hover:text-forest-400 transition-colors"
              >
                {title || 'Untitled'}
              </a>
            </h3>

            {/* Description */}
            {description && (
              <p className="text-sm text-foreground-muted dark:text-gray-400 line-clamp-2 mb-3">
                {description}
              </p>
            )}
          </>
        )}

        {/* Tags */}
        {bookmarkTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3" data-testid="bookmark-tags">
            {bookmarkTags.map((tag) => (
              <TagChip
                key={tag.ID}
                label={tag.title}
                size="sm"
                onRemove={() => {
                  updateTagMutation.mutate({
                    id: tag.ID,
                    updates: {
                      bookmarkID: removeBookmarkFromTag(tag, id)
                    }
                  })
                }}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div
          className={`relative flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 transition-opacity duration-200 ${
            hover ? 'opacity-100' : 'opacity-0 sm:opacity-0'
          } opacity-100 sm:opacity-0 sm:group-hover:opacity-100`}
        >
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => {
              setModalContent(
                <UpdateBookmark
                  id={id}
                  title={title}
                  description={description}
                  setMode={setUpdateMode}
                />
              )
              openModal()
            }}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => setQuickTagOpen((prev) => !prev)}
            data-testid="quick-tag-button"
          >
            <FontAwesomeIcon icon={faTag} className="mr-1" />
            Tag
          </Button>

          <DeleteBookmark id={id} authorID={user?.sub} />

          {quickTagOpen && (
            <QuickTagPicker
              bookmarkId={id}
              onClose={() => setQuickTagOpen(false)}
            />
          )}
        </div>
      </div>
    </article>
  )
}
