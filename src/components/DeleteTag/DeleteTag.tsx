import { useModalStore } from '../../store/modal-store'
import { useDeleteTag } from '../../api/hooks'

interface Props {
  ID: string
  tagName: string
}

const DeleteTag = ({ ID, tagName }: Props) => {
  const deleteTagMutation = useDeleteTag()
  const closeModal = useModalStore((store) => store.closeModal)

  return (
    <div>
      <p className="text-center bold mb-4">{`Are you sure you want to delete the ${tagName} category?`}</p>
      <div className="flex justify-center">
        <button
          data-testid={`delete-tag`}
          className="btn btn-primary mr-4"
          onClick={() => {
            deleteTagMutation.mutate(ID)
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
