import React from "react"
import { useNftNotification } from "../context/NFTNotificationContext"
import styles from "../styles/Home.module.css"
import SingleNotification from "../components/NFTSingleNotification"

const NftNotification = () => {
    // Access the notification context to get notifications and functions to manipulate them
    const { nftNotifications, showNftNotification, clearNftNotification, closeNftNotification } =
        useNftNotification()

    return (
        <div className={styles.notificationsContainer}>
            {/* Map through the notifications and render each one using the SingleNotification component */}
            {nftNotifications.map((notification) => (
                <SingleNotification
                    key={notification.id}
                    className={`${styles.nftNotification} ${styles[notification.type]}`}
                    notification={notification}
                    clearNftNotification={clearNftNotification} // Pass the function directly
                    showNftNotification={showNftNotification} // Pass the function to manage notifications
                    closeNftNotification={closeNftNotification}
                />
            ))}
        </div>
    )
}

export default NftNotification
