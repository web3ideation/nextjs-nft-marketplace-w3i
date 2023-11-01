// SingleNotification.js
import React, { useState, useEffect } from "react"
import styles from "../styles/Home.module.css"

const SingleNotification = ({
    className,
    notification,
    clearNftNotification,
    dataIndex,
    showNftNotifications, // This function needs to be passed from the parent component
}) => {
    const [animation, setAnimation] = useState("")

    useEffect(() => {
        // Start the enter animation immediately
        setAnimation(styles.enter)

        // Timer for fading out the notification
        let exitTimer
        if (!notification.isSticky) {
            exitTimer = setTimeout(() => {
                setAnimation(styles.exit)
            }, notification.duration || 5000 - 1000) // Start the exit animation 1 second before the end
        }

        // Cleanup function
        return () => {
            if (exitTimer) clearTimeout(exitTimer)
        }
    }, [notification.isSticky, notification.duration])

    // Event listener for the end of the animation
    const handleAnimationEnd = (e) => {
        if (e.animationName === styles.slideOut) {
            showNftNotifications((currentNotifications) => {
                return currentNotifications.filter((notif) => notif.id !== notification.id)
            })
        }
    }

    // Combine the classes for the element
    const notificationClass = `${className} ${styles.nftNotification} ${
        notification.type === "error" ? styles.error : styles.success
    } ${animation}`

    return (
        <div
            className={notificationClass}
            onAnimationEnd={handleAnimationEnd}
            data-index={dataIndex}
            style={{ display: notification.isVisible ? "block" : "none" }} // Hier steuern Sie die Sichtbarkeit
        >
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
            {notification.isSticky && (
                <button onClick={() => clearNftNotification(notification.id)}>Close</button>
            )}
        </div>
    )
}

export default SingleNotification
