// React Imports
import React from "react"
import { useAccount } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"

// Custom Hooks and Components
import ConnectWalletBtn from "@components/Header/WalletConnect/ConnectWalletButton/ConnectWalletBtn"
import LoadingWave from "@components/UX/LoadingWave/LoadingWave"

// Styles
import styles from "./SingleNotification.module.scss"

// Component for displaying a single notification
const SingleNotification = ({
    notification,
    closeNftNotification,
    clearNftNotification,
    onClose,
}) => {
    const { isConnected } = useAccount()
    const { open } = useWeb3Modal()
    // Handles the end of the exit animation
    const handleAnimationEnd = (e) => {
        if (e.animationName === styles.slideOut) {
            clearNftNotification(notification.id)
        }
    }

    const handleCloseClick = () => {
        closeNftNotification(notification.id)
        if (onClose) {
            onClose(notification.id)
        }
    }

    // Function to determine the appropriate style based on the notification type
    const getNotificationTypeStyle = (type) => {
        switch (type) {
            case "error":
                return styles.error
            case "success":
                return styles.success
            case "info":
                return styles.info
            default:
                return ""
        }
    }

    // Combines classes for the notification element
    const notificationClasses = [
        styles.nftNotification,
        notification.isSticky ? styles.sticky : styles.enter,
        getNotificationTypeStyle(notification.type),
        notification.closing ? styles.exit : "",
    ].join(" ")

    return (
        <div className={notificationClasses} onAnimationEnd={handleAnimationEnd}>
            <div className={styles.nftNotificationInnerWrapper}>
                <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    {!isConnected && notification.type === "info" && (
                        <ConnectWalletBtn onConnect={() => open()} />
                    )}
                </div>
                {notification.isSticky && (
                    <div className={styles.nftNotificationBtnWrapper}>
                        <button
                            className={styles.notificationCloseButton}
                            onClick={handleCloseClick}
                        >
                            <img src="/media/close_icon.png" alt="Close Notification" />
                        </button>
                        <div className={styles.loadingWrapperNotification}>
                            <LoadingWave />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SingleNotification
