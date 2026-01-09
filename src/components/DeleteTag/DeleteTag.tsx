import { useModalStore } from '../../store/modal-store'
import { useDeleteTag } from '../../api/hooks'
import { Button } from '../ui/button'

interface Props {
  ID: string
  tagName: string
}

const DeleteTag = ({ ID, tagName }: Props) => {
  const deleteTagMutation = useDeleteTag()
  const closeModal = useModalStore((store) => store.closeModal)

  return (
    <div>
      <p className="text-center bold mb-4 text-foreground">{`Are you sure you want to delete the ${tagName} category?`}</p>
      <div className="flex justify-center gap-4">
        <Button
          data-testid={`delete-tag`}
          variant="destructive"
          onClick={() => {
            deleteTagMutation.mutate(ID)
            closeModal()
          }}
        >
          Yes
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            closeModal()
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

export { DeleteTag }
