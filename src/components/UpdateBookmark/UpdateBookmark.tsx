import { useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { Bookmark } from '../Bookmarks'
import { Loader } from '../Loader'
import { useUser } from '../../contexts/user-context'
import { AddTag } from './AddTag'
import { SEARCH_BOOKMARKS } from '../Search'
import { usePageStore } from '../../store/page-store'
import { useModalStore } from '../../store/modal-store'

type UpdateBookmarkProps = Omit<Bookmark, 'url'> & {
  setMode: (val: boolean) => void
}

export const UPDATE_BOOKMARK_MUTATION = gql`
  mutation UPDATE_BOOKMARK(
    $id: ID!
    $updates: BookmarkInput
    $userUpdates: UserInput
  ) {
    updateBookmark(id: $id, updates: $updates) {
      title
    }
    updateUser(user: $userUpdates) {
      id
      name
      email
    }
  }
`

export const UpdateBookmark = ({
  id,
  title,
  description
}: UpdateBookmarkProps) => {
  const offset = usePageStore((state) => state.offset)
  const perPage = usePageStore((state) => state.perPage)
  const search = usePageStore((state) => state.search)

  const { data: userData } = useUser()
  const [formData, setFormData] = useState<
    Pick<Bookmark, 'title' | 'description'>
  >({
    title,
    description
  })
  const closeModal = useModalStore((state) => state.closeModal)

  const [updateBookmark, { loading, error }] = useMutation(
    UPDATE_BOOKMARK_MUTATION,
    {
      refetchQueries: [
        {
          query: SEARCH_BOOKMARKS,
          variables: {
            offset,
            limit: perPage,
            input: {
              authorID: userData.createUser.id,
              title: search,
              description: search
            }
          }
        }
      ]
    }
  )

  if (loading) return <Loader />

  if (error) return <p>Error :(</p>

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
              await updateBookmark({
                variables: {
                  id,
                  updates: {
                    ...formData
                  },
                  userUpdates: {
                    id: userData.createUser.id
                  }
                }
              })

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
