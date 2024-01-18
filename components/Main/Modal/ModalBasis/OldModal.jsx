// React imports (React core and hooks)
import React, { forwardRef, useEffect, useState } from "react"
import ReactDOM from "react-dom"

// Styles import
import styles from "../../../../styles/Home.module.css"

// Modal component using forwardRef for parent components to reference
const Modal = forwardRef((props, ref) => {
    // Destructuring props for clarity and ease of use
    const { show, closeModal, children, okText, onOk, cancelListing, clearMessages, modalTitle } =
        props

    // Early return if the modal is not visible
    if (!show) return null
    console.log("SHOW", show)
    // Prevents propagation of click events to avoid unintended closures of the modal
    const handleModalContentClick = (e) => e.stopPropagation()

    // Determine the text and action for the secondary button based on the available props
    const secondaryButtonText = clearMessages ? "Clear Messages" : "DELIST"
    const secondaryButtonAction = clearMessages ? clearMessages : cancelListing

    // New state to track animation status
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        // Trigger the animation when 'show' changes
        if (show) {
            setIsAnimating(true)
        }
    }, [show])

    // Function to handle end of animatio
    const handleAnimationEnd = () => {
        if (!show) {
            setIsAnimating(false)
        }
    }

    if (!isAnimating && !show) return null
    // State für das Beenden der Animation
    const [isClosing, setIsClosing] = useState(false)

    // Funktion, um das Modal zu schließen und die Animation zu starten
    const startClosingModal = () => {
        setIsClosing(true)
        setTimeout(() => {
            setIsAnimating(false) // Stellt sicher, dass die Animation abgeschlossen ist
            setIsClosing(false) // Setzt den Zustand zurück, nachdem das Modal geschlossen wurde
            closeModal()
        }, 400) // Stellen Sie sicher, dass diese Zeit der Dauer Ihrer Ausgangsanimation entspricht
    }
    const modalClassName = `${styles.modalBackdrop} ${
        isClosing ? styles.modalExit : show ? styles.modalEnter : ""
    }`

    console.log("Modal class", modalClassName)
    // Modal content structure
    const modalContent = (
        <div
            ref={ref}
            className={modalClassName}
            onClick={startClosingModal}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className={styles.modalContentWrapper} onClick={handleModalContentClick}>
                <div className={styles.modalContentInnerWrapper}>
                    <div className={styles.modalHeaderWrapper}>
                        <h3>{modalTitle}</h3>
                        <button className={styles.closeButton} onClick={startClosingModal}>
                            <img
                                src="/media/close_icon.png"
                                alt="Close modal"
                                aria-label="Close Button"
                            />
                        </button>
                    </div>
                    {children}
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
        </div>
    )

    // Render the modal using React Portal to attach it to 'document.body'
    // This allows the modal to be on top of everything else on the page
    return ReactDOM.createPortal(modalContent, document.body)
})

export default Modal
