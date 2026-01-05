import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { useDeleteBookmark } from '../../api/hooks'

interface Props {
  id?: string
  authorID?: string
}

export const DeleteBookmark = ({ id }: Props) => {
  const deleteBookmarkMutation = useDeleteBookmark()

  return (
    <button
      className="btn btn-sm font-bold"
      onClick={async (e) => {
        e.preventDefault()
        if (id) {
          deleteBookmarkMutation.mutate(id)
        }
      }}
    >
      <FontAwesomeIcon icon={faTrashCan} />
    </button>
  )
}
