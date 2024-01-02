// Modal.js
import React, { forwardRef } from "react"
import ReactDOM from "react-dom"
import styles from "../../styles/Home.module.css"

const Modal = forwardRef(
    (
        { isVisible, onCancel, children, okText, onOk, cancelText, cancelListing, modalTitle },
        ref
    ) => {
        if (!isVisible) return null

        // Prevent clicking in the modal from closing the modal
        const handleModalContentClick = (e) => e.stopPropagation()

        const modalContent = (
            <div ref={ref} className={styles.modalBackdrop} onClick={onCancel}>
                <div className={styles.modalContentWrapper} onClick={handleModalContentClick}>
                    <div className={styles.modalContentInnerWrapper}>
                        <div className={styles.modalHeaderWrapper}>
                            <h3>{modalTitle}</h3>
                            <button className={styles.closeButton} onClick={onCancel}>
                                <img src="/media/close_icon.png"></img>
                            </button>
                        </div>
                        {children}
                        <div className={styles.modalFooterWrapper}>
                            {cancelListing && <button onClick={cancelListing}>DELIST</button>}
                            {okText && <button onClick={onOk}>{okText}</button>}
                        </div>
                    </div>
                </div>
            </div>
        )

        // The modal is rendered directly into 'document.body' using ReactDOM.createPortal
        return ReactDOM.createPortal(modalContent, document.body)
    }
)

export default Modal
