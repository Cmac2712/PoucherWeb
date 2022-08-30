import { useState, useContext } from "react";
import { useMutation, gql } from "@apollo/client"
import { GET_BOOKMARKS_BY_AUTHOR } from "../Bookmarks";
import { BookmarkInput } from "../CreateBookmark";
import { PageContext } from "../Bookmarks";

interface Props {
  id?: number
  title?: string
  description?: string
  screenshotURL?: string | null
  authorID?: string
  setMode?: (mode: boolean) => void
}

export const UPDATE_BOOKMARK_MUTATION = gql`
  mutation UPDATE_BOOKMARK($id: ID!, $updates: BookmarkInput) {
    updateBookmark(id: $id, updates: $updates) {
      title
    }
  }
`
export const UpdateBookmark = ({ 
  id, 
  title, 
  description, 
  authorID, 
  setMode 
}: Props) => {

  const { offset, perPage} = useContext(PageContext)
  const [formData, setFormData] = useState<Partial<BookmarkInput>>({
    title,
    description
  })

  const [updateBookmark, { loading, error, data }] = useMutation(UPDATE_BOOKMARK_MUTATION
    , {
    refetchQueries: [
      {
        query: GET_BOOKMARKS_BY_AUTHOR,
        variables: {
          id: authorID,
          offset,
          limit: perPage
        }
      }
    ]
  }
  );

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