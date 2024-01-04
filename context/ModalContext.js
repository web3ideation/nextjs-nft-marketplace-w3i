import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react"

// Erstellen eines Contexts
const ModalContext = createContext({
    modalType: null,
    modalProps: {},
    openModal: () => {},
    closeModal: () => {},
})

// Custom hook to access the modal context in components.
export const useModalContext = () => useContext(ModalContext)

export const ModalProvider = ({ children }) => {
    const [modalType, setModalType] = useState(null)
    const [modalProps, setModalProps] = useState({})
    const [openModals, setOpenModals] = useState(0) // Zum Verfolgen der Anzahl der geöffneten Modals

    const closeModal = useCallback(() => {
        setModalType(null)
        setModalProps({})
        setOpenModals((prev) => prev - 1) // Modal wird geschlossen
    }, [])

    const openModal = useCallback(
        (type, props = {}) => {
            // Beim Öffnen eines neuen Modals, schließen Sie das aktuelle Modal (wenn vorhanden)
            if (modalType) {
                closeModal()
            }
            setModalType(type)
            setModalProps({ ...props, children: props.children })
            setOpenModals((prev) => prev + 1) // Modal wird geöffnet
        },
        [modalType, closeModal]
    )

    const determineModalActions = useCallback((type, modalProps) => {
        let okText, onOkHandler

        switch (type) {
            case "info":
                if (modalProps.isListed) {
                    okText = "BUY"
                    onOkHandler = modalProps.handleBuyClick
                } else {
                    okText = ""
                    onOkHandler = () => {}
                }
                break
            case "list":
                okText = "LIST"
                onOkHandler = modalProps.handleListClick
                break
            case "sell":
                okText = "UPDATE"
                onOkHandler = modalProps.handleUpdatePriceButtonClick
                break
            default:
                okText = ""
                onOkHandler = () => {}
        }

        return { okText, onOkHandler }
    }, [])

    // Wenn die Anzahl der geöffneten Modals sich ändert, passen Sie das Scroll-Verhalten an
    useEffect(() => {
        if (openModals > 0) {
            document.body.style.overflow = "hidden" // Verhindern des Scrollens, wenn Modals geöffnet sind
        } else {
            document.body.style.overflow = "auto" // Scrollen erlauben, wenn alle Modals geschlossen sind
        }
    }, [openModals])

    const contextValue = useMemo(
        () => ({
            modalType,
            modalProps,
            openModal,
            closeModal,
            openModals, // Anzahl der geöffneten Modals
            determineModalActions,
        }),
        [modalType, modalProps, openModal, closeModal, openModals, determineModalActions]
    )

    return <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>
}

export default ModalProvider
