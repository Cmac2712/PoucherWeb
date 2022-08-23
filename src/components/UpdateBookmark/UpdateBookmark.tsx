import { useState } from "react";
import { useMutation, gql } from "@apollo/client"
import { GET_BOOKMARKS } from "../Bookmarks";
import { BookmarkInput } from "../CreateBookmark";

interface UpdateBookmarkProps {
  id?: number
  title?: string
  description?: string
  screenshotURL?: string | null
  setMode?: (mode: boolean) => void
}

export const UPDATE_BOOKMARK_MUTATION = gql`
  mutation UPDATE_BOOKMARK($id: ID!, $updates: BookmarkInput) {
    updateBookmark(id: $id, updates: $updates) {
      title
    }
  }
`
export const UpdateBookmark = (
  { id, title, description, setMode }: UpdateBookmarkProps
) => {

  const [formData, setFormData] = useState<Partial<BookmarkInput>>({
    title,
    description
  })

  const [updateBookmark, { loading, error, data }] = useMutation(UPDATE_BOOKMARK_MUTATION, {
    refetchQueries: [
      {
        query: GET_BOOKMARKS
      }
    ]
  });

  if (loading) return (
    <div className="mb-4">
      <p>Loading...</p>
    </div>
  )

  if (error) return <p>Error :(</p>;

  return (
    <div className="bookmark-preview flex flex-wrap w-full">
      <h2 className="text-xl w-full">
        <input
          className="w-full"
          type="text"
          placeholder="new title"
          name="title"
          defaultValue={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
      </h2>
      <p className="w-full">
        <textarea
          className="w-full"
          placeholder="new description"
          name="description"
          defaultValue={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </p>
      <div className="tasks ml-auto">
        <button
          className="text-green-900 font-bold uppercase mr-2"
          onClick={() => {
            updateBookmark({
              variables: {
                id,
                updates: formData
              }
            })

            if (setMode) setMode(false)
          }
          }
        >
          Save
        </button>
      </div>
    </div>
  )
}