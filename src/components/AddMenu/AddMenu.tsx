import { useState } from 'react'
import { useCognitoAuth } from '../../contexts/auth-context'
import { useCreateBookmark } from '../../api/hooks'
import { useModalStore } from '../../store/modal-store'
import { NoteEditor } from '../Notes'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faClose, faBookmark, faNoteSticky, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid'
import { Bookmark } from '../Bookmarks'

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

export const AddMenu = () => {
  const { user } = useCognitoAuth()
  const [bookmarkOpen, setBookmarkOpen] = useState(false)
  const [formData, setFormData] = useState<Pick<Bookmark, 'title' | 'url'>>({ title: '', url: '' })
  const createBookmarkMutation = useCreateBookmark()
  const { openModal, setModalContent } = useModalStore()

  const handleBookmarkSelect = () => {
    setBookmarkOpen(true)
    navigator.clipboard.readText().then((clip) => {
      if (!isURL(clip)) return
      setFormData((prev) => ({ ...prev, url: clip }))
    })
  }

  const handleNoteSelect = () => {
    setModalContent(<NoteEditor />)
    openModal()
  }

  const handleBookmarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createBookmarkMutation.mutate({
      id: uuidv4(),
      title: formData.url,
      authorID: user?.sub,
      url: formData.url,
    })
    setFormData({ title: '', url: '' })
    setBookmarkOpen(false)
  }

  const handleBookmarkClose = () => {
    setBookmarkOpen(false)
    setFormData({ title: '', url: '' })
  }

  if (bookmarkOpen) {
    return (
      <form onSubmit={handleBookmarkSubmit} className="flex items-center gap-2">
        <Input
          disabled={createBookmarkMutation.isPending}
          type="text"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://..."
          className="w-48 sm:w-64"
          autoFocus
        />
        <Button type="submit" disabled={createBookmarkMutation.isPending || !formData.url}>
          {createBookmarkMutation.isPending ? 'Adding...' : 'Add'}
        </Button>
        <Button type="button" size="icon" variant="ghost" onClick={handleBookmarkClose}>
          <FontAwesomeIcon icon={faClose} />
        </Button>
      </form>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2">
          <FontAwesomeIcon icon={faPlus} />
          <span className="hidden sm:inline">Add</span>
          <FontAwesomeIcon icon={faChevronDown} className="text-xs opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
