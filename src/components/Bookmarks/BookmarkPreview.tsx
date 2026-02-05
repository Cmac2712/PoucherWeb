import { useState } from 'react'
import { UpdateBookmark } from '../UpdateBookmark'
import { DeleteBookmark } from '../DeleteBookmark'
import { Bookmark } from './Bookmarks'
import { useCognitoAuth } from '../../contexts/auth-context'
import { useModalStore } from '../../store/modal-store'
import { Button } from '../ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'

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
  data: { id, url, title, description, screenshotURL, metadataStatus }
}: Props) => {
  const [, setUpdateMode] = useState(false)
  const [hover, setHover] = useState(false)
  const { user } = useCognitoAuth()
  const { openModal, setModalContent } = useModalStore()

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-forest-300 dark:hover:border-forest-600 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Image */}
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {screenshotURL ? (
            <img
              src={screenshotURL}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <FontAwesomeIcon icon={faGlobe} className="text-4xl" />
            </div>
          )}
        </div>
      </a>

      {/* Content */}
      <div className="p-4">
        {/* Domain */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs text-foreground-muted dark:text-gray-400 truncate">
            {getDomain(url)}
          </p>
          {metadataStatus === 'pending' && (
            <span className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Fetching metadata
            </span>
          )}
          {metadataStatus === 'failed' && (
            <span className="text-[10px] uppercase tracking-wide text-red-600 dark:text-red-400">
              Metadata failed
            </span>
          )}
        </div>

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
          <p className="text-sm text-foreground-muted dark:text-gray-400 line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {/* Actions */}
        <div
          className={`flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 transition-opacity duration-200 ${
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
                  screenshotURL={screenshotURL}
                />
              )
              openModal()
            }}
          >
            Edit
          </Button>

          <DeleteBookmark id={id} authorID={user?.sub} />
        </div>
      </div>
    </article>
  )
}
