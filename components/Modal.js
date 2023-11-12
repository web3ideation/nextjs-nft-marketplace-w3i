// Modal.js
import React from "react"
import { Button } from "web3uikit"
import ReactDOM from "react-dom"
import styles from "../styles/Home.module.css"

const Modal = ({ isVisible, onCancel, children, okText, onOk, cancelText }) => {
    if (!isVisible) return null

    // Verhindern, dass das Klicken im Modal das Modal schließt
    const handleModalContentClick = (e) => e.stopPropagation()

    const modalContent = (
        <div className={styles.modalBackdrop} onClick={onCancel}>
            <div className={styles.modalContentWrapper} onClick={handleModalContentClick}>
                {children}
                <div className={styles.modalFooter}>
                    {cancelText && <Button onClick={onCancel} text={cancelText} />}
                    {okText && <Button onClick={onOk} text={okText} />}
                </div>
            </div>
        </div>
    )

    // Das Modal wird mit ReactDOM.createPortal direkt in 'document.body' gerendert
    return ReactDOM.createPortal(modalContent, document.body)
}

export default Modal
