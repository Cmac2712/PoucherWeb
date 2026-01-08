import { useState } from 'react'
import { Bookmark } from '../Bookmarks'
import { Loader } from '../Loader'
import { useUser } from '../../contexts/user-context'
import { AddTag } from './AddTag'
import { useModalStore } from '../../store/modal-store'
import { useUpdateBookmark, useUpdateUser } from '../../api/hooks'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

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
          <Input
            className="w-full mb-2"
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
            className="flex min-h-[80px] w-full rounded-md border border-forest-700 bg-background-dark px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest-500 disabled:cursor-not-allowed disabled:opacity-50"
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
          <Button
            className="font-bold uppercase mt-2"
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
          </Button>
        </div>
      </div>
    </div>
  )
}
