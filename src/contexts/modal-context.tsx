import { useState, useContext, createContext, Dispatch, SetStateAction, ReactNode } from "react"

interface ModalProviderProps {
  children: ReactNode
}

type ModalContextProps = {
  setModalOpen: Dispatch<SetStateAction<boolean>>
  modalOpen: boolean
  setModalContent: Dispatch<SetStateAction<ReactNode | false>>
  modalContent: ReactNode | undefined
} | undefined

const ModalContext = createContext<ModalContextProps>(undefined)

export const useModal = () => {
  const context = useContext(ModalContext)

  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }

  return context
}

export const ModalProvider = ({ children }: ModalProviderProps) => {

  const [modalOpen, setModalOpen] = useState(false) 
  const [modalContent, setModalContent] = useState(false) 

  const value = {
    setModalOpen,
    modalOpen,
    setModalContent,
    modalContent
  }

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}