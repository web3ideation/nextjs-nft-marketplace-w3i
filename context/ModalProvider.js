// React Imports
import React, { createContext, useContext, useState } from "react"

// ModalContext Creation
const ModalContext = createContext()

// Custom Hook for modal state manipulation
export const useModal = () => useContext(ModalContext)

// ModalProvider Component
export const ModalProvider = ({ children }) => {
    // State for modal open status
    const [isModalOpen, setModalOpen] = useState(false)

    // State for modal type ('info', 'sell', 'list', 'update', 'chat')
    const [modalType, setModalType] = useState(null)

    // State for modal lifecycle state ('closed', 'opening', 'closing', 'changingIn', 'changingOut')
    const [modalState, setModalState] = useState("closed")

    // State for content to display in the modal
    const [modalContent, setModalContent] = useState(null)

    // State for tracking current modal ID
    const [currentModalId, setCurrentModalId] = useState(null)

    // Open modal function
    const openModal = (type, id, content = null) => {
        if (isModalOpen && currentModalId !== id) {
            if (modalType !== type) {
                closeModal(currentModalId)
                setModalState("changingOut")
                setTimeout(() => {
                    setModalContent(content)
                    setModalState("changingIn")
                    setModalType(type)
                    setCurrentModalId(id)
                    setModalOpen(true)
                }, 400)
            } else {
                setModalContent(content)
            }
            return
        }
        setModalType(type)
        setModalOpen(true)
        setModalState("opening")
        setCurrentModalId(id)
        setModalContent(content)
    }

    // Close modal function
    const closeModal = (id) => {
        if (currentModalId === id) {
            setModalState("closing")
            setTimeout(() => {
                setModalOpen(false)
                setModalState("closed")
                setModalType(null)
                setCurrentModalId(null)
                setModalContent(null)
            }, 400)
        }
    }

    // Context value
    const contextValue = {
        isModalOpen,
        modalType,
        modalState,
        openModal,
        closeModal,
        modalContent,
        currentModalId,
    }

    return <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>
}
