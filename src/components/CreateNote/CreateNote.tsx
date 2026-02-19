import { useModalStore } from '../../store/modal-store'
import { NoteEditor } from '../Notes'
import { Button } from '../ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faNoteSticky } from '@fortawesome/free-solid-svg-icons'

export const CreateNote = () => {
  const { openModal, setModalContent } = useModalStore()

  const handleClick = () => {
    setModalContent(<NoteEditor />)
    openModal()
  }

  return (
    <Button onClick={handleClick} variant="outline" className="gap-2">
      <FontAwesomeIcon icon={faNoteSticky} />
      <span className="hidden sm:inline">Add Note</span>
    </Button>
  )
}
