import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { useDeleteBookmark } from '../../api/hooks'
import { Button } from '../ui/button'

interface Props {
  id?: string
  authorID?: string
}

export const DeleteBookmark = ({ id }: Props) => {
  const deleteBookmarkMutation = useDeleteBookmark()

  return (
    <Button
      size="sm"
      variant="destructive"
      className="font-bold"
      onClick={async (e) => {
        e.preventDefault()
        if (id) {
          deleteBookmarkMutation.mutate(id)
        }
      }}
    >
      <FontAwesomeIcon icon={faTrashCan} />
    </Button>
  )
}
