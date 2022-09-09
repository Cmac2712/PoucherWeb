import { useState, useContext } from "react";
import { useMutation, gql } from "@apollo/client"
import { SEARCH_BOOKMARKS } from "../Bookmarks";
import { Bookmark } from "../Bookmarks";
import { usePage } from "../../contexts/page-context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

type Props = Omit<Bookmark, 'url'> & {
  setMode: (val: boolean) => void
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
  screenshotURL,
  tags,
  setMode
}: Props) => {

  const { offset, perPage, search } = usePage()
  const [formData, setFormData] = useState<Pick<Bookmark, 'title' | 'description' | 'tags'>>({
    title,
    description,
    tags
  })

  const [updateBookmark, { loading, error, data }] = useMutation(UPDATE_BOOKMARK_MUTATION, {
      refetchQueries: [
        {
          query: SEARCH_BOOKMARKS,
          variables: {
            offset,
            limit: perPage,
            input: {
              authorID,
              title: search,
              description: search
            }
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
     <div  className={`bookmark-preview px-4 py-5 lg:py-3 relative w-full max-w-3xl flex flex-wrap md:flex-nowrap`}>
      <div className="bookmark-preview-image mr-0 w-24 md:h-24 max-h-24 basis-24 shrink-0 object-cover overflow-hidden text-0 mb-2">
        <img
          className="rounded"
          width='100%'
          height='100%'
          src={screenshotURL}
          alt=""
        />
      </div>
      <div className="bookmark-preview-info basis-auto md:pl-4">
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
        <p className="w-full mb-4">
          <input
            className="w-full bg-base-300 p-2"
            placeholder="add tags"
            name="description"
            onChange={e => {
              const newTags = `${tags ? tags + ',' : ''}${'tag:'+e.target.value}`

              setFormData({ ...formData, tags: newTags })
            }}
          />
        </p>
        <div className="tags mb-2">
          { tags && 
              <div className="badges">
                { tags.split(',').map((tag, i) => {

                  const [hide, setHide] = useState(false)

                  return (
                    <div 
                      key={i} 
                      className={`badge badge-info gap-2 mr-2 ${hide ? 'hidden' : ''}`}
                    >
                      <button
                        onClick={e => {
                          const newTags = tags.split(',').filter(oldTag => oldTag !== tag).join(',')

                          setFormData({ ...formData, tags: newTags })
                          setHide(true)
                        }}
                      >
                        <FontAwesomeIcon icon={faClose} />
                      </button>
                      {tag.split(':')[1]}
                    </div>
                  )
                }) }
              </div>
          }
        </div>
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
    </div>
  )
}