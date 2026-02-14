import { useState } from 'react'
import { useUser } from '../../contexts/user-context'
import { useUpdateTag } from '../../api/hooks'
import { Button } from '../ui/button'
import { tagContainsBookmark, addBookmarkToTag } from '../../utils/tag-utils'

interface Props {
  ID: string
}

const AddTag = ({ ID }: Props) => {
  const { data } = useUser()
  const tags = data?.tags || []

  const currentTags = () =>
    tags.map((tag) => {
      if (!tagContainsBookmark(tag, ID)) return

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
      const updatedBookmarkID = addBookmarkToTag(found, ID)

      // No-op if bookmark is already in this tag (prevents duplicates)
      if (updatedBookmarkID === found.bookmarkID) return

      updateTagMutation.mutate({
        id: found.ID,
        updates: {
          bookmarkID: updatedBookmarkID
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
            className="flex h-9 w-full rounded-md border border-forest-700 bg-background-dark px-3 py-1 text-sm text-foreground shadow-sm mr-2"
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
          <Button
            onClick={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            Add
          </Button>
        </>
      )}
    </form>
  )
}

export { AddTag }
