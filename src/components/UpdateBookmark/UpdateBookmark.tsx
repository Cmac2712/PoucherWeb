import { useState, Dispatch, SetStateAction } from "react";
import { useMutation, gql } from "@apollo/client"
import { TagsObj } from '../Bookmarks'
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

interface TagProps {
  tag: string
  setToDelete: Dispatch<SetStateAction<string[]>> 
  toDelete: string[]
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
      tags
    }
  }
`

const mergeTags = (tags:string[], tagsObject: TagsObj ) => {

  if (!tagsObject) return JSON.stringify({ list: tags })

  if (!tags?.length) return JSON.stringify(tagsObject)

  if (typeof tagsObject === 'string') throw new Error('Tags Object must be object')

  return JSON.stringify({
    list: [...new Set(tags.concat(tagsObject.list))]
  })
}

const removeTags = (tags:string[], tagsObject: TagsObj) => {

  if (!tags.length) return tagsObject

  if (typeof tagsObject === 'string') throw new Error('Tags Object must be parsed')

  return {
    list: tagsObject.list.filter(tag => !tags.includes(tag)) 
  }
}

const Tag = ({
  tag,
  setToDelete,
  toDelete
}:TagProps) => {

  const [hide, setHide] = useState(false)

  return (
    <div 
      className={`badge badge-info gap-2 mr-2 ${hide ? 'hidden' : ''}`}
    >
      <button
        onClick={() => {
          setToDelete([...toDelete, tag])
          setHide(true)
        }}
      >
        <FontAwesomeIcon icon={faClose} />
      </button>
      { tag ? tag.split(':')[1] : '' }
    </div>
  )
}

export const UpdateBookmark = ({
  id,
  title,
  description,
  screenshotURL,
  tags,
  setMode
}: UpdateBookmarProps) => {

  const { offset, perPage, search } = usePage()
  const { data: userData } = useUser()
  const [toDelete, setToDelete] = useState<string[]>([])
  const [formData, setFormData] = useState<Pick<Bookmark, 'title' | 'description'> & { tags: string[] }>({
    title,
    description,
    tags: typeof tags === 'string' ? JSON.parse(tags).list : tags?.list
  })
  const userTags:TagsObj = JSON.parse(userData.createUser.tags as string);
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
              description: search,
              tags: search
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
          <p className="w-full mb-4">
            <input
              className="w-full bg-base-300 p-2"
              placeholder="add tags"
              name="tags"
              onChange={e => {
                setFormData({ ...formData, tags: e.target.value.split(' ').map(tag => 'tag:' + tag) })
              }}
            />
          </p>
          <div className="tags mb-2">
            { typeof tags === 'object' && tags.list && 
                <div className="badges flex flex-wrap">
                  { tags.list.map((tag, i) => {
                    return (
                      <div key={i}>
                        <Tag tag={tag} toDelete={toDelete} setToDelete={setToDelete } />
                      </div>
                    ) 
                  })
                  }
                </div>
            }
          </div>
          <div className="tasks ml-auto">
            <button
              className="btn font-bold uppercase mt-2"
              onClick={async () => {

                const newBookmarkTags = mergeTags(formData.tags, removeTags(toDelete, tags))
                const newUserTags = mergeTags(formData.tags, removeTags(toDelete, userTags))

                 const updated = await updateBookmark({
                  variables: {
                    id,
                    updates: {
                      ...formData,
                      tags: newBookmarkTags
                    },
                    userUpdates: {
                      id: userData.createUser.id,
                      tags: newUserTags 
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