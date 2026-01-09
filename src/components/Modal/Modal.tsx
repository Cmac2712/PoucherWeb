import { useModalStore } from '../../store/modal-store'
import { Dialog, DialogContent } from '../ui/dialog'

const Modal = () => {
  const { modalOpen, modalContent, closeModal } = useModalStore()

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent>
        {modalContent}
      </DialogContent>
    </Dialog>
  )
}

export { Modal }
