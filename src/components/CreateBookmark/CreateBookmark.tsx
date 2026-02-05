import axios from 'axios'
import { useState } from 'react'
import { useCognitoAuth } from '../../contexts/auth-context'
import { Bookmark } from '../Bookmarks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faClose } from '@fortawesome/free-solid-svg-icons'
import { useCreateBookmark } from '../../api/hooks'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const isURL = (str: string) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // fragment locator
  return !!pattern.test(str)
}

export const getScreenshot = async (url: string) => {
  try {
    const endpoint = import.meta.env.VITE_SERVER_ENDPOINT
    const response = await axios.post(
      `${endpoint}screenshot?url=${encodeURIComponent(url)}`,
      {
        url: encodeURIComponent(url)
      }
    )

    return response.data.thumbnailKey as string | null
  } catch (e) {
    console.error(e)
    return false
  }
}

export const CreateBookmark = () => {
  const { user } = useCognitoAuth()
  const [formData, setFormData] = useState<Pick<Bookmark, 'title' | 'url'>>({
    title: '',
    url: ''
  })
  const [open, setOpen] = useState(false)

  const createBookmarkMutation = useCreateBookmark()

  const handleOpen = () => {
    setOpen(true)
    navigator.clipboard.readText().then((clip) => {
      if (!isURL(clip)) return
      setFormData({
        ...formData,
        url: clip
      })
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setFormData({ title: '', url: '' })

    const id = uuidv4()

    createBookmarkMutation.mutate({
      id: id,
      title: formData.url,
      authorID: user?.sub,
      url: formData.url,
    })
    setOpen(false)
  }

  if (!open) {
    return (
      <Button onClick={handleOpen} className="gap-2">
        <FontAwesomeIcon icon={faPlus} />
        <span className="hidden sm:inline">Add Bookmark</span>
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        disabled={createBookmarkMutation.isPending}
        type="text"
        value={formData.url}
        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
        name="url"
        placeholder="https://..."
        className="w-48 sm:w-64"
        autoFocus
      />
      <Button
        type="submit"
        disabled={createBookmarkMutation.isPending || !formData.url}
      >
        {createBookmarkMutation.isPending ? 'Adding...' : 'Add'}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => {
          setOpen(false)
          setFormData({ title: '', url: '' })
        }}
      >
        <FontAwesomeIcon icon={faClose} />
      </Button>
    </form>
  )
}
