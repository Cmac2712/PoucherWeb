import { useState } from 'react'
import { Bookmark } from '../Bookmarks'
import { Loader } from '../Loader'
import { useUser } from '../../contexts/user-context'
import { AddTag } from './AddTag'
import { useModalStore } from '../../store/modal-store'
import { useUpdateBookmark, useUpdateUser } from '../../api/hooks'

type UpdateBookmarkProps = Omit<Bookmark, 'url'> & {
  setMode: (val: boolean) => void
}

export const UpdateBookmark = ({
  id,
  title,
  description
}: UpdateBookmarkProps) => {
  const { data: userData } = useUser()
  const [formData, setFormData] = useState<
    Pick<Bookmark, 'title' | 'description'>
  >({
    title,
    description
  })
  const closeModal = useModalStore((state) => state.closeModal)

  const updateBookmarkMutation = useUpdateBookmark()
  const updateUserMutation = useUpdateUser()

  const isPending = updateBookmarkMutation.isPending || updateUserMutation.isPending
  const isError = updateBookmarkMutation.isError || updateUserMutation.isError

  if (isPending) return <Loader />

  if (isError) return <p>Error :(</p>

  return (
    <div
      className={`bookmark-preview relative w-full max-w-3xl flex flex-wrap md:flex-nowrap`}
    >
      <div className="bookmark-preview-info basis-full">
        <h2 className="text-xl w-full">
          <input
            className="input input-primary w-full mb-2 p-2"
            type="text"
            placeholder="new title"
            name="title"
            defaultValue={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </h2>
        <p className="w-full">
          <textarea
            className="textarea textarea-primary w-full"
            placeholder="new description"
            name="description"
            defaultValue={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </p>
        <AddTag ID={id} />
        <div className="tasks ml-auto">
          <button
            className="btn font-bold uppercase mt-2"
            onClick={async () => {
              await updateBookmarkMutation.mutateAsync({
                id,
                updates: formData
              })

              if (userData?.user.id) {
                await updateUserMutation.mutateAsync({
                  id: userData.user.id,
                  updates: {}
                })
              }

              closeModal()
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
