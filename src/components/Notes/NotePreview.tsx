import { useState } from 'react'
import { useDeleteNote } from '../../api/hooks'
import { useModalStore } from '../../store/modal-store'
import { NoteEditor } from './NoteEditor'
import { Button } from '../ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faNoteSticky, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import type { Note } from '../../api/types'

interface Props {
  data: Note
}

function stripHtml(html: string) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

export const NotePreview = ({ data: note }: Props) => {
  const [hover, setHover] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { openModal, setModalContent } = useModalStore()
  const deleteNote = useDeleteNote()

  const plainContent = stripHtml(note.content)

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-forest-300 dark:hover:border-forest-600 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Note icon badge */}
      <div className="absolute top-2 right-2 z-10 text-amber-500 dark:text-amber-400">
        <FontAwesomeIcon icon={faNoteSticky} className="text-lg" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-foreground dark:text-gray-100 mb-2 line-clamp-2 leading-tight pr-6">
          {note.title || 'Untitled'}
        </h3>

        {/* Content preview */}
        {plainContent && (
          <p className="text-sm text-foreground-muted dark:text-gray-400 line-clamp-3 mb-3">
            {plainContent}
          </p>
        )}

        {/* Date */}
        {note.createdAt && (
          <p className="text-xs text-foreground-muted dark:text-gray-500">
            {new Date(note.createdAt).toLocaleDateString()}
          </p>
        )}

        {/* Actions */}
        <div
          className={`flex items-center gap-2 pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 transition-opacity duration-200 ${
            hover ? 'opacity-100' : 'opacity-0 sm:opacity-0'
          } opacity-100 sm:opacity-0 sm:group-hover:opacity-100`}
        >
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => {
              setModalContent(<NoteEditor note={note} />)
              openModal()
            }}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="destructive"
            className="font-bold"
            onClick={(e) => {
              e.preventDefault()
              setDeleteOpen(true)
            }}
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="p-8">
          <DialogHeader className="mb-2">
            <DialogTitle>Delete note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteNote.mutate(note.id)
                setDeleteOpen(false)
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  )
}
