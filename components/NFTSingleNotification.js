import React, { useState, useEffect } from "react"
import styles from "../styles/Home.module.css"
import { CrossCircle } from "web3uikit"

const SingleNotification = ({
    className,
    notification,
    clearNftNotification, // This function should be used to clear a sticky notification
    dataIndex,
    showNftNotifications, // This function should be used to remove the notification from the list
}) => {
    const [animation, setAnimation] = useState(styles.enter) // Default to the enter animation

    useEffect(() => {
        // If the notification is not sticky, set a timer to trigger the exit animation
        let exitTimer
        if (!notification.isSticky) {
            const duration = notification.duration || 6000 // Default duration is 6000ms
            exitTimer = setTimeout(() => {
                setAnimation(styles.exit) // Trigger the exit animation
            }, duration - 1000) // Start the exit animation 1 second before the duration ends
        }

        // Cleanup function to clear the timer if the component is unmounted
        return () => {
            if (exitTimer) clearTimeout(exitTimer)
        }
    }, [notification.isSticky, notification.duration])

    // Handle the end of the exit animation
    const handleAnimationEnd = (e) => {
        if (e.animationName === styles.slideOut) {
            // Remove the notification from the list
            clearNftNotification((currentNotifications) =>
                currentNotifications.filter((notif) => notif.id !== notification.id)
            )
        }
    }

    // Combine the classes for the notification element
    const notificationClasses = [
        className,
        styles.nftNotification,
        notification.type === "error" ? styles.error : styles.success,
        animation,
    ].join(" ")

    return (
        <div
            className={notificationClasses}
            onAnimationEnd={handleAnimationEnd}
            data-index={dataIndex}
            style={{ display: notification.isVisible ? "block" : "none" }} // Control the visibility of the notification
        >
            <div className={styles.nftNotificationInnerWrapper}>
                <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                </div>
                {notification.isSticky && (
                    // Provide a button to clear sticky notifications
                    <button onClick={() => clearNftNotification(notification.id)}>
                        <CrossCircle fontSize={35} />
                    </button>
                )}
            </div>
        </div>
    )
}

export default SingleNotification
