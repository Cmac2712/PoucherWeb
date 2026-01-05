import axios from 'axios'
import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Bookmark } from '../Bookmarks'
import { Loader } from '../Loader/Loader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faClose } from '@fortawesome/free-solid-svg-icons'
import { usePageStore } from '../../store/page-store'
import { useCreateBookmark } from '../../api/hooks'
import { v4 as uuidv4 } from 'uuid'
import './CreateBookmark.css'

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

export const getBookmarkInfo = async (url: string, cb?: () => void) => {
  const endpoint = import.meta.env.VITE_SERVER_ENDPOINT
  const response = await axios.post(
    `${endpoint}getBookmarkInfo?url=${encodeURIComponent(url)}`,
    {
      url: encodeURIComponent(url)
    }
  )

  if (typeof cb !== 'undefined') cb()

  return response.data.page
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
  const count = usePageStore((state) => state.count)

  const { user } = useAuth0()
  const [formData, setFormData] = useState<Pick<Bookmark, 'title' | 'url'>>({
    title: '',
    url: ''
  })
  const [open, setOpen] = useState(count && count > 0 ? false : true)
  const [loadingInfo, setLoadingInfo] = useState(false)

  const createBookmarkMutation = useCreateBookmark()

  return (
    <>
      <div
        className={`flex relative bottom-20 m-auto h-12 z-10 ${
          open ? 'slide-in' : 'slide-out'
        }`}
      >
        <button
          className="btn btn-square rounded-r-none"
          onClick={(e) => {
            e.preventDefault()
            setOpen(false)
          }}
        >
          <FontAwesomeIcon icon={faClose} />
        </button>
        <form
          className="flex"
          onSubmit={async (e) => {
            e.preventDefault()

            setFormData({ title: '', url: '' })
            setLoadingInfo(true)

            const id = uuidv4()
            const info = await getBookmarkInfo(formData.url, () => {
              setLoadingInfo(false)
              setOpen(false)
            })

            createBookmarkMutation.mutate({
              id: id,
              title: info.title,
              description: info.description,
              authorID: user?.sub,
              url: formData.url,
              screenshotURL: info.image
            })
          }}
        >
          <input
            disabled={createBookmarkMutation.isPending || loadingInfo}
            type="text"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            name="url"
            placeholder="https://&hellip;"
            className="input input-bordered border-x-0  w-full max-w-xs rounded-none"
          />

          <button
            className="btn btn-square normal-case w-28 flex-grow-0 flex-auto px-4 rounded-l-none"
            type="submit"
          >
            {createBookmarkMutation.isPending || loadingInfo ? <Loader /> : 'Add'}
          </button>
        </form>
      </div>

      <button
        className="btn btn-square px-4 absolute top-0 bottom-0 m-auto right-4 h-12"
        onClick={() => {
          setOpen(!open)
          navigator.clipboard.readText().then((clip) => {
            if (!isURL(clip)) return

            setFormData({
              ...formData,
              url: clip
            })
          })
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </>
  )
}
