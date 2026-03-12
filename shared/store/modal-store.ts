import create from 'zustand'

interface ModalStoreProps {
  openModal: () => void
  closeModal: () => void
  modalOpen: boolean
  setModalContent: (modalContent: JSX.Element | boolean) => void
  modalContent: JSX.Element | boolean
}

const useModalStore = create<ModalStoreProps>((set) => ({
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
  modalOpen: false,
  setModalContent: (modalContent) => set({ modalContent }),
  modalContent: false
}))

export { useModalStore }
