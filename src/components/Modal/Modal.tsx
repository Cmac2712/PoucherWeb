//import { useModal } from '../../contexts/modal-context'
import { useModalStore } from '../../store/modal-store'

const Modal = () => {
  const { modalOpen, modalContent, closeModal } = useModalStore()

  return (
    <div
      onClick={(e) => {
        if (!(e.target as HTMLElement).classList.contains('modal')) return

        closeModal()
      }}
      className={`modal ${
        modalOpen && 'opacity-100 visible pointer-events-auto'
      }`}
    >
      <div className="modal-box">{modalContent}</div>
    </div>
  )
}

export { Modal }
