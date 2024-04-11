import React from "react"
import { useAccount } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import ConnectWalletBtn from "@components/Header/WalletConnect/ConnectWalletButton/ConnectWalletBtn"
import LoadingWave from "@components/UX/LoadingWave/LoadingWave"
import styles from "./SingleNotification.module.scss"

const SingleNotification = ({
    notification,
    closeNftNotification,
    clearNftNotification,
    onClose,
}) => {
    const { isConnected } = useAccount()
    const { open } = useWeb3Modal()

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
