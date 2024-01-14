// React imports (React core and hooks)
import React, { forwardRef } from "react"
import ReactDOM from "react-dom"

// Styles import
import styles from "../../../../styles/Home.module.css"

// Modal component using forwardRef for parent components to reference
const Modal = forwardRef((props, ref) => {
    // Destructuring props for clarity and ease of use
    const {
        isVisible,
        closeModal,
        children,
        okText,
        onOk,
        cancelListing,
        clearMessages,
        modalTitle,
    } = props

    // Early return if the modal is not visible
    if (!isVisible) return null

    const isVisibleBool = !!isVisible

    // Prevents propagation of click events to avoid unintended closures of the modal
    const handleModalContentClick = (e) => e.stopPropagation()

    // Determine the text and action for the secondary button based on the available props
    const secondaryButtonText = clearMessages ? "Clear Messages" : "DELIST"
    const secondaryButtonAction = clearMessages ? clearMessages : cancelListing

    // Modal content structure
    const modalContent = (
        <div ref={ref} className={styles.modalBackdrop} onClick={closeModal}>
            <div className={styles.modalContentWrapper} onClick={handleModalContentClick}>
                <div className={styles.modalContentInnerWrapper}>
                    <div className={styles.modalHeaderWrapper}>
                        <h3>{modalTitle}</h3>
                        <button className={styles.closeButton} onClick={closeModal}>
                            <img src="/media/close_icon.png" alt="Close modal" />
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
