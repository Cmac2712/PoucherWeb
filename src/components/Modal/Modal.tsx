import { useModal } from '../../contexts/modal-context'

const Modal = () => {
    
    const { modalOpen, modalContent, setModalContent, closeModal } = useModal()

    return (
        <div 
            onClick={e => {

                if (!(e.target as HTMLElement).classList.contains('modal')) return

                closeModal() 
            }}
            className={`modal ${modalOpen && 'opacity-100 visible pointer-events-auto'}`}
        >
            <div className="modal-box">
                { modalContent }
            </div>
        </div>
    )
}

export { Modal }