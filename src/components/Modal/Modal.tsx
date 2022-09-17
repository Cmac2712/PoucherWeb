import { useModal } from '../../contexts/modal-context'

const Modal = () => {
    
    const { modalOpen, modalContent, setModalOpen } = useModal()

    return (
        <div 
            onClick={e => {
                if (e.target.classList.contains('modal')) setModalOpen(false) 
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