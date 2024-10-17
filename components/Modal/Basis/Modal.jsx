import React, { forwardRef, useEffect, useState } from "react"
import ReactDOM from "react-dom"
import Image from "next/image"
import { useModal } from "@context"
import { BtnWithAction } from "@components"
import styles from "./Modal.module.scss"

const Modal = forwardRef((props, ref) => {
    const [isClient, setIsClient] = useState(false)
    useEffect(() => {
        // Set the state to true after the component mounts
        setIsClient(true)
    }, [])

    const { children, modalTitle, buttons = [] } = props
    const { isModalOpen, closeModal, modalState, currentModalId } = useModal()

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow
        document.body.style.overflow = ["opening", "changingOut", "changingIn"].includes(
            modalState
        )
            ? "hidden"
            : modalState === "closed"
            ? "auto"
            : originalStyle
        return () => {
            document.body.style.overflow = originalStyle
        }
    }, [modalState])

    if (!isModalOpen) return null

    const handleCloseModal = () => closeModal(currentModalId)
    const handleModalContentClick = (e) => e.stopPropagation()

    const renderedButtons = buttons.length ? (
        buttons.map((button, index) => (
            <BtnWithAction
                key={index}
                onClickAction={button.action}
                buttonText={button.text}
                style={{ width: "50%" }}
            />
        ))
    ) : (
        <div className={styles.noButtonsPlaceholder}></div>
    )

    const modalBackdropClassName = `${styles.modalBackdrop} ${
        styles[
            modalState === "opening"
                ? "modalBackdropEnter"
                : modalState === "closing"
                ? "modalBackdropExit"
                : ""
        ]
    }`
    const modalAnimationClassName = `${styles.modalContainer} ${
        styles[
            modalState === "opening"
                ? "modalEnter"
                : modalState === "closing"
                ? "modalExit"
                : modalState === "changingOut"
                ? "modalChangingOut"
                : modalState === "changingIn"
                ? "modalChangingIn"
                : ""
        ]
    }`
    if (!isClient) {
        // If we are still on the server, render nothing
        return null
    }
    const modalContent = (
        <div ref={ref} className={modalBackdropClassName} onClick={handleCloseModal}>
            <div className={modalAnimationClassName}>
                <div className={styles.modalContentWrapper} onClick={handleModalContentClick}>
                    <div className={styles.modalHeaderWrapper}>
                        <h3>{modalTitle}</h3>
                        <button className={styles.closeButton} onClick={handleCloseModal}>
                            <Image
                                src="/media/close_icon.png"
                                alt="Close modal"
                                width={100}
                                height={100}
                                priority={true}
                                aria-label="Close Button"
                            />
                        </button>
                    </div>
                    <div className={styles.modalContentInnerWrapper}>{children}</div>
                    <div className={styles.modalFooterWrapper}>{renderedButtons}</div>
                </div>
            </div>
        </div>
    )

    return isModalOpen ? ReactDOM.createPortal(modalContent, document.body) : null
})

Modal.displayName = "Modal"

export default Modal
