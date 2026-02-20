import { useEffect, useState } from 'react'
import { useCognitoAuth } from '../../contexts/auth-context'
import { useCreateBookmark } from '../../api/hooks'
import { useModalStore } from '../../store/modal-store'
import { NoteEditor } from '../Notes'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DialogTitle } from '../ui/dialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faBookmark, faNoteSticky } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid'

const isURL = (str: string) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\#[-a-z\\d_]*)?$',
    'i'
  )
  return !!pattern.test(str)
}

const BookmarkForm = () => {
  const { user } = useCognitoAuth()
  const { closeModal } = useModalStore()
  const [url, setUrl] = useState('')
  const createBookmarkMutation = useCreateBookmark()

  useEffect(() => {
    navigator.clipboard.readText().then((clip) => {
      if (isURL(clip)) setUrl(clip)
    }).catch(() => {})
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createBookmarkMutation.mutate({
      id: uuidv4(),
      title: url,
      authorID: user?.sub,
      url,
    })
    closeModal()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogTitle>Add Bookmark</DialogTitle>
      <Input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        autoFocus
        disabled={createBookmarkMutation.isPending}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" disabled={createBookmarkMutation.isPending || !url}>
          {createBookmarkMutation.isPending ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </form>
  )
}

export const AddMenu = () => {
  const [open, setOpen] = useState(false)
  const { openModal, setModalContent } = useModalStore()

  const handleBookmarkSelect = () => {
    setOpen(false)
    setModalContent(<BookmarkForm />)
    openModal()
  }

  const handleNoteSelect = () => {
    setOpen(false)
    setModalContent(<NoteEditor />)
    openModal()
  }

  const actions = [
    { label: 'Note', icon: faNoteSticky, onClick: handleNoteSelect, delay: 'delay-[0ms]' },
    { label: 'Bookmark', icon: faBookmark, onClick: handleBookmarkSelect, delay: 'delay-[50ms]' },
  ]

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB + speed-dial */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-4">
        {/* Action items */}
        {actions.map(({ label, icon, onClick, delay }) => (
          <div
            key={label}
            className={`flex items-center gap-3 transition-all duration-200 ${delay} ${
              open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
            }`}
          >
            {/* Label pill */}
            <span className="bg-white dark:bg-gray-800 text-foreground dark:text-gray-100 text-sm font-medium px-3 py-1.5 rounded-full shadow-md border border-gray-100 dark:border-gray-700 whitespace-nowrap">
              {label}
            </span>
            {/* Mini FAB */}
            <button
              onClick={onClick}
              className="h-12 w-12 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-forest-600 dark:text-forest-400 shadow-md hover:shadow-lg hover:bg-forest-50 dark:hover:bg-gray-700 transition-all duration-150 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={icon} />
            </button>
          </div>
        ))}

        {/* Main FAB */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="h-14 w-14 rounded-full bg-forest-600 hover:bg-forest-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <FontAwesomeIcon
            icon={faPlus}
            className={`text-lg transition-transform duration-300 ${open ? 'rotate-45' : 'rotate-0'}`}
          />
        </button>
      </div>
    </>
  )
}
