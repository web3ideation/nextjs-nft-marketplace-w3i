// Modal.js
import React from "react"
import { Button } from "web3uikit"
import ReactDOM from "react-dom"
import styles from "../styles/Home.module.css"

const Modal = ({ isVisible, onCancel, children, okText, onOk, cancelText, cancelListing }) => {
    if (!isVisible) return null

    // Verhindern, dass das Klicken im Modal das Modal schließt
    const handleModalContentClick = (e) => e.stopPropagation()

    const modalContent = (
        <div className={styles.modalBackdrop} onClick={onCancel}>
            <div className={styles.modalContentWrapper} onClick={handleModalContentClick}>
                {children}
                <div className={styles.modalFooterWrapper}>
                    {cancelListing && <Button onClick={cancelListing} text="Cancel Listing" />}
                    {okText && <Button onClick={onOk} text={okText} />}
                    {cancelText && <Button onClick={onCancel} text={cancelText} />}
                </div>
            </div>
        </div>
    )

    // Das Modal wird mit ReactDOM.createPortal direkt in 'document.body' gerendert
    return ReactDOM.createPortal(modalContent, document.body)
}

export default Modal
