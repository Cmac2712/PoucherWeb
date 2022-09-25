import { useState, Dispatch, SetStateAction } from "react";
import { useMutation, gql } from "@apollo/client"
import { Bookmark } from "../Bookmarks"
import { Loader } from '../Loader'
import { usePage, SEARCH_BOOKMARKS } from "../../contexts/page-context"
import { useUser } from '../../contexts/user-context'
import { useModal } from '../../contexts/modal-context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

type UpdateBookmarProps = Omit<Bookmark, 'url'> & {
  setMode: (val: boolean) => void
}  

export const UPDATE_BOOKMARK_MUTATION = gql`
  mutation UPDATE_BOOKMARK($id: ID!, $updates: BookmarkInput, $userUpdates: UserInput) {
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
  description,
  screenshotURL,
  setMode
}: UpdateBookmarProps) => {

  const { offset, perPage, search } = usePage()
  const { data: userData } = useUser()
  const [toDelete, setToDelete] = useState<string[]>([])
  const [formData, setFormData] = useState<Pick<Bookmark, 'title' | 'description'>>({
    title,
    description
  })
  const { closeModal } = useModal()

  const [updateBookmark, { loading, error }] = useMutation(UPDATE_BOOKMARK_MUTATION, {
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
  );

  if (loading) return <Loader /> 

  if (error) return <p>Error :(</p>

  return (
      <div  className={`bookmark-preview relative w-full max-w-3xl flex flex-wrap md:flex-nowrap`}>
        <div className="bookmark-preview-info basis-full">
          <h2 className="text-xl w-full">
            <input
              className="w-full mb-2 bg-base-300 p-2"
              type="text"
              placeholder="new title"
              name="title"
              defaultValue={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </h2>
          <p className="w-full">
            <textarea
              className="w-full bg-base-300 p-2"
              placeholder="new description"
              name="description"
              defaultValue={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </p>
          <div className="tasks ml-auto">
            <button
              className="btn font-bold uppercase mt-2"
              onClick={async () => {

                 const updated = await updateBookmark({
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

              }
              }
            >
              Save
            </button>
          </div>
        </div>
      </div>
  )
}