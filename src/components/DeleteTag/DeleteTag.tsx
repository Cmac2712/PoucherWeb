import { useMutation, gql } from '@apollo/client'
import { useModalStore } from '../../store/modal-store'

const DELETE_TAG_MUTATION = gql`
  mutation DeleteTag($tag: TagInput!) {
    deleteTag(tag: $tag) {
      ID
      title
    }
  }
`

interface Props {
  ID: string
  tagName: string
}

const DeleteTag = ({ ID, tagName }: Props) => {
  const [deleteTag] = useMutation(DELETE_TAG_MUTATION, {
    update(cache) {
      cache.evict({ fieldName: 'createUser' })
    }
  })
  const closeModal = useModalStore((store) => store.closeModal)

  return (
    <div>
      <p className="text-center bold mb-4">{`Are you sure you want to delete the ${tagName} category?`}</p>
      <div className="flex justify-center">
        <button
          data-testid={`delete-tag`}
          className="btn btn-primary mr-4"
          onClick={() => {
            deleteTag({
              variables: {
                tag: {
                  ID
                }
              }
            })
            closeModal()
          }}
        >
          Yes
        </button>
        <button
          onClick={() => {
            closeModal()
          }}
          className="btn"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export { DeleteTag }
