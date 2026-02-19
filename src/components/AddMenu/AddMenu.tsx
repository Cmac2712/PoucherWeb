import { useEffect, useState } from 'react'
import { useCognitoAuth } from '../../contexts/auth-context'
import { useCreateBookmark } from '../../api/hooks'
import { useModalStore } from '../../store/modal-store'
import { NoteEditor } from '../Notes'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DialogTitle } from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
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
  const { openModal, setModalContent } = useModalStore()

  const handleBookmarkSelect = () => {
    setModalContent(<BookmarkForm />)
    openModal()
  }

  const handleNoteSelect = () => {
    setModalContent(<NoteEditor />)
    openModal()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <FontAwesomeIcon icon={faPlus} className="text-lg" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="mb-2">
        <DropdownMenuItem onSelect={handleBookmarkSelect}>
          <FontAwesomeIcon icon={faBookmark} className="text-forest-500" />
          Bookmark
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleNoteSelect}>
          <FontAwesomeIcon icon={faNoteSticky} className="text-forest-500" />
          Note
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
