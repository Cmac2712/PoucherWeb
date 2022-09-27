import { useMutation, gql } from '@apollo/client'
import { useState } from 'react'
import { useUser } from '../../contexts/user-context'

const UPDATE_TAG = gql`
  mutation UpdateTag($tag: TagInput!) {
    updateTag(tag: $tag) {
      ID
      bookmarkID
    }
  }
`

interface Props {
  ID: string
}

const AddTag = ({ ID }: Props) => {
  const { data: { getTags: tags } = { getTags: [] } } = useUser()
  const [updateTag, { loading, error }] = useMutation(UPDATE_TAG, {
    update(cache) {
      cache.evict({ fieldName: 'createUser' })
    }
  })
  const [formData, setFormData] = useState({
    newTag: ''
  })
  const handleSubmit = () => {
    const found = tags.find((tag) => tag.ID === formData.newTag)

    if (found) {
      const tagList = JSON.parse(found.bookmarkID)

      tagList.list.push(ID)

      updateTag({
        variables: {
          tag: {
            ID: found.ID,
            bookmarkID: JSON.stringify(tagList)
          }
        }
      })

      return
    }
  }

  return (
    <form onSubmit={handleSubmit} action="">
      <div className="tags flex">
        {/* List tags for current bookmark */}
        {tags.map((tag) => {
          const hasTag = JSON.parse(tag.bookmarkID)?.list.find(
            (bookmarkID: string) => bookmarkID === ID
          )

          if (!hasTag) return

          return (
            <p key={tag.ID} className="pr-2">
              {tag?.title}
            </p>
          )
        })}
      </div>
      {/* <input
        onChange={(e) => setFormData({ newTag: e.target.value })}
        className="input input-primary input-sm"
        type="text"
      /> */}

      {tags && (
        <>
          <select
            id={ID}
            name="choose-category"
            className="input input-primary mr-2"
            onChange={(e) => {
              setFormData({ newTag: e.target.value })
            }}
          >
            <option value="--" disabled selected>
              Choose a category
            </option>
            {tags.map((tag) => {
              return (
                <option key={tag.ID} value={tag.ID}>
                  {tag.title}
                </option>
              )
            })}
          </select>
          <button
            className="btn"
            onClick={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            Add
          </button>
        </>
      )}
    </form>
  )
}

export { AddTag }
