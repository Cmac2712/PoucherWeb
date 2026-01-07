import { useState } from 'react'
import { useUser } from '../../contexts/user-context'
import { useUpdateTag } from '../../api/hooks'

interface Props {
  ID: string
}

const AddTag = ({ ID }: Props) => {
  const { data } = useUser()
  const tags = data?.tags || []

  const currentTags = () =>
    tags.map((tag) => {
      const hasTag = JSON.parse(tag.bookmarkID)?.list.find(
        (bookmarkID: string) => bookmarkID === ID
      )

      if (!hasTag) return

      return (
        <p key={tag.ID} className="pr-2">
          {tag?.title}
        </p>
      )
    })

  const updateTagMutation = useUpdateTag()

  const [formData, setFormData] = useState({
    newTag: ''
  })

  const handleSubmit = () => {
    const found = tags.find((tag) => tag.ID === formData.newTag)

    if (found) {
      const tagList = JSON.parse(found.bookmarkID)

      tagList.list.push(ID)

      updateTagMutation.mutate({
        id: found.ID,
        updates: {
          bookmarkID: JSON.stringify(tagList)
        }
      })

      return
    }
  }

  return (
    <form onSubmit={handleSubmit} action="">
      <div className="tags flex">
        {/* List tags for current bookmark */}
        {currentTags()}
      </div>

      {tags && (
        <>
          <select
            id={ID}
            name="choose-category"
            className="input input-primary mr-2"
            onChange={(e) => {
              setFormData({ newTag: e.target.value })
            }}
            defaultValue={'--'}
          >
            <option value="--" disabled>
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
