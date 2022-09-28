import { useMutation, gql } from '@apollo/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

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
}

const DeleteTag = ({ ID }: Props) => {
  const [deleteTag] = useMutation(DELETE_TAG_MUTATION, {
    update(cache) {
      cache.evict({ fieldName: 'createUser' })
    }
  })

  return (
    <button
      data-testid={`delete-tag`}
      className="text-red-300"
      onClick={() =>
        deleteTag({
          variables: {
            tag: {
              ID
            }
          }
        })
      }
    >
      <FontAwesomeIcon icon={faTimes} />
    </button>
  )
}

export { DeleteTag }
