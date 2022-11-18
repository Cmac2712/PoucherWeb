import { useMutation, gql } from '@apollo/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

const DELETE_BOOKMARK_MUTATION = gql`
  mutation DELETE_BOOKMARK($id: ID!) {
    deleteBookmark(id: $id) {
      id
      title
      url
    }
  }
`

interface Props {
  id?: string
  authorID?: string
}

export const DeleteBookmark = ({ id, authorID }: Props) => {
  const [deleteBookmark] = useMutation(DELETE_BOOKMARK_MUTATION, {
    update(cache) {
      cache.evict({ fieldName: 'searchBookmarks' })
    }
  })

  return (
    <button
      className="btn btn-sm font-bold"
      onClick={async (e) => {
        e.preventDefault()
        deleteBookmark({
          variables: {
            id
          }
        })
      }}
    >
      <FontAwesomeIcon icon={faTrashCan} />
    </button>
  )
}

export { DELETE_BOOKMARK_MUTATION }
