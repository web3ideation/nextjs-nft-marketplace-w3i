import React, { createContext, useEffect, useContext, useState } from "react"
import { useAccount } from "wagmi"
const ModalContext = createContext()

export const useModal = () => useContext(ModalContext)

export const ModalProvider = ({ children }) => {
    const { isConnected } = useAccount()
    useEffect(() => {
        if (!isConnected) {
            setModalOpen(true)
            setModalType("welcome")
        }
    }, [isConnected])
    const [isModalOpen, setModalOpen] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [modalState, setModalState] = useState("closed")
    const [modalContent, setModalContent] = useState(null)
    const [currentModalId, setCurrentModalId] = useState(null)

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
