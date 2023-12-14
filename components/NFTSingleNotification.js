import React from "react"
import styles from "../styles/Home.module.css"
import LoadingWave from "../components/LoadingWave"

const SingleNotification = ({ notification, clearNftNotification }) => {
    // Handle the end of the exit animation
    const handleAnimationEnd = (e) => {
        if (e.animationName === styles.slideOut) {
            // Nachdem die Animation beendet ist, entfernen Sie die Benachrichtigung
            clearNftNotification(notification.id)
        }
    }

    // Function to get the appropriate style based on notification type
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

    // Combine the classes for the notification element
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
                </div>
                {notification.isSticky && (
                    // Provide a button to clear sticky notifications and adding LoadingWave
                    <div className={styles.nftNotificationBtnWrapper}>
                        <button onClick={() => clearNftNotification(notification.id)}>X</button>
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
