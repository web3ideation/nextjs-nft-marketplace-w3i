import React from "react"
import styles from "../styles/Home.module.css"
import { CrossCircle } from "web3uikit"
import LoadingWave from "../components/LoadingWave"

const SingleNotification = ({ notification, clearNftNotification }) => {
    // Handle the end of the exit animation
    const handleAnimationEnd = (e) => {
        if (e.animationName === styles.slideOut) {
            // Nachdem die Animation beendet ist, entfernen Sie die Benachrichtigung
            clearNftNotification(notification.id)
        }
    }

    // Combine the classes for the notification element
    const notificationClasses = [
        styles.nftNotification,
        notification.isSticky ? styles.sticky : styles.enter, // Verwenden Sie 'sticky' für dauerhafte Benachrichtigungen
        notification.type === "error" ? styles.error : styles.success,
        notification.closing ? styles.exit : "",
    ].join(" ")

    return (
        <div className={notificationClasses} onAnimationEnd={handleAnimationEnd}>
            <div className={styles.nftNotificationInnerWrapper}>
                <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                </div>
                {notification.isSticky && (
                    // Provide a button to clear sticky notifications and adding LoadingWave
                    <div className={styles.nftNotificationBtnWrapper}>
                        <button onClick={() => clearNftNotification(notification.id)}>
                            <CrossCircle fontSize={25} />
                        </button>
                        <div className={styles.loadingWrapperNotification}>
                            <LoadingWave></LoadingWave>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SingleNotification
