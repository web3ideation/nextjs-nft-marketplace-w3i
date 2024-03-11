// React imports: Core and hooks
import React, { forwardRef, useEffect } from "react"
import ReactDOM from "react-dom"

// Custom hooks import
import { useModal } from "../../../../context/ModalProvider"

// Styles import
import styles from "./Modal.module.scss"

/**
 * Modal component with forwardRef for parent components to reference.
 * Utilizes a custom hook from IPModalContext to manage modal state and actions.
 */
const Modal = forwardRef((props, ref) => {
    // Destructuring props for clarity and ease of use
    const { children, okText, onOk, cancelListing, clearMessages, modalTitle } = props
    // Using useModal hook to manage modal state and actions
    const { isModalOpen, closeModal, modalState, currentModalId } = useModal()
    useEffect(() => {
        // Speichern des ursprünglichen overflow-Wertes des body-Elements
        const originalStyle = window.getComputedStyle(document.body).overflow

        if (modalState === "opening" || "changing") {
            document.body.style.overflow = "hidden"
        } else if (modalState === "closed") {
            document.body.style.overflow = "auto"
        }

        // Aufräumfunktion, die den ursprünglichen overflow-Stil wiederherstellt
        return () => {
            document.body.style.overflow = originalStyle
        }
    }, [modalState])

    // Early return if the modal is not visible
    if (!isModalOpen) return null

    const handleCloseModal = () => {
        closeModal(currentModalId)
    }

    // Prevents propagation of click events within the modal content
    const handleModalContentClick = (e) => e.stopPropagation()

    // Determine the text and action for the secondary button based on the available props
    const secondaryButtonText = clearMessages ? "Clear Messages" : "DELIST"
    const secondaryButtonAction = clearMessages ? clearMessages : cancelListing

    // Class name determination based on the modalState
    const modalClassName = `${styles.modalBackdrop} ${
        modalState === "opening"
            ? styles.modalEnter
            : modalState === "closing"
            ? styles.modalExit
            : modalState === "changingOut"
            ? styles.modalChangingOut
            : modalState === "changingIn"
            ? styles.modalChangingIn
            : ""
    }`

    // Structure of the modal content
    const modalContent = (
        <div ref={ref} className={modalClassName} onClick={handleCloseModal}>
            <div className={styles.modalContentWrapper} onClick={handleModalContentClick}>
                <div className={styles.modalHeaderWrapper}>
                    <h3>{modalTitle}</h3>
                    <button className={styles.closeButton} onClick={handleCloseModal}>
                        <img
                            src="/media/close_icon.png"
                            alt="Close modal"
                            aria-label="Close Button"
                        />
                    </button>
                </div>
                <div className={styles.modalContentInnerWrapper}>{children}</div>
                <div className={styles.modalFooterWrapper}>
                    {(clearMessages || cancelListing) && (
                        <button onClick={secondaryButtonAction}>{secondaryButtonText}</button>
                    )}
                    {Array.isArray(okText)
                        ? okText.map((text, index) => (
                              <button key={text} onClick={onOk[index]}>
                                  {text}
                              </button>
                          ))
                        : okText && <button onClick={onOk}>{okText}</button>}
                </div>
            </div>
        </div>
    )

    // Renders the modal using React Portal to attach it to 'document.body'
    return isModalOpen ? ReactDOM.createPortal(modalContent, document.body) : null
})

// ForwardRef Display Name
// Adding a display name to the component for better debugging in developer tools.
Modal.displayName = "Modal"

export default Modal
